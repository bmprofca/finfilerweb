import { apiCall } from './apiCall';

const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

let scriptPromise = null;

export const loadRazorpayScript = () => {
  if (typeof window !== 'undefined' && window.Razorpay) {
    return Promise.resolve(true);
  }

  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = RAZORPAY_SCRIPT_URL;
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => {
        scriptPromise = null;
        reject(new Error('Failed to load Razorpay checkout'));
      };
      document.body.appendChild(script);
    });
  }

  return scriptPromise;
};

export const initiateOrderPayment = async (orderId, amount, gstNo, walletAmount) => {
  const payload = { order_id: orderId };
  if (amount !== undefined && amount !== null && amount !== '') {
    payload.amount = Number(amount);
  }
  if (gstNo !== undefined && gstNo !== null && gstNo !== '') {
    payload.gst_no = gstNo;
  }
  if (walletAmount !== undefined && walletAmount !== null && Number(walletAmount) > 0) {
    payload.wallet_amount = Number(walletAmount);
  }

  const response = await apiCall('/orders/payments/initiate', 'POST', payload);
  const body = await response.json();

  if (!response.ok || !body.success) {
    throw new Error(body.message || 'Failed to initiate payment');
  }

  return body.data;
};

export const verifyRazorpayPayment = async (orderId, paymentResponse) => {
  const response = await apiCall('/orders/payments/verify', 'POST', {
    order_id: orderId,
    razorpay_order_id: paymentResponse.razorpay_order_id,
    razorpay_payment_id: paymentResponse.razorpay_payment_id,
    razorpay_signature: paymentResponse.razorpay_signature,
  });
  const body = await response.json();

  if (!response.ok || !body.success) {
    throw new Error(body.message || 'Payment verification failed');
  }

  return body.data;
};

export const openRazorpayCheckout = async ({ keyId, checkout, onDismiss }) => {
  await loadRazorpayScript();

  return new Promise((resolve, reject) => {
    let settled = false;

    const finish = (handler, value) => {
      if (settled) return;
      settled = true;
      handler(value);
    };

    const options = {
      key: keyId,
      amount: checkout.amount,
      currency: checkout.currency,
      name: checkout.name,
      description: checkout.description,
      order_id: checkout.order_id,
      prefill: checkout.prefill,
      notes: checkout.notes,
      handler: (paymentResponse) => finish(resolve, paymentResponse),
      modal: {
        ondismiss: () => {
          onDismiss?.();
          finish(reject, new Error('Payment cancelled'));
        },
      },
      theme: { color: '#4f46e5' },
    };

    const rzp = new window.Razorpay(options);

    rzp.on('payment.failed', (event) => {
      const message =
        event?.error?.description || event?.error?.reason || 'Payment failed';
      finish(reject, new Error(message));
    });

    rzp.open();
  });
};

export const payForOrder = async (orderId, { amount, gstNo, onDismiss } = {}) => {
  const { key_id: keyId, checkout } = await initiateOrderPayment(orderId, amount, gstNo);
  const paymentResponse = await openRazorpayCheckout({
    keyId,
    checkout,
    onDismiss,
  });
  const verified = await verifyRazorpayPayment(orderId, paymentResponse);
  return verified;
};

/**
 * Pay for an order with optional wallet split.
 * - If razorpayAmount > 0: initiates payment, opens Razorpay for razorpayAmount, then verifies.
 * - If razorpayAmount === 0 (wallet covers all): initiates with wallet_amount only, no Razorpay checkout.
 */
export const payForOrderWithWallet = async (
  orderId,
  { amount, walletAmount = 0, razorpayAmount, gstNo, onDismiss } = {},
) => {
  const data = await initiateOrderPayment(orderId, amount, gstNo, walletAmount);

  // If there's nothing to pay via Razorpay (wallet covered it all)
  if (!razorpayAmount || razorpayAmount <= 0) {
    // The server already processed the wallet deduction on initiate
    // Return the data directly (no Razorpay checkout needed)
    return data;
  }

  // Otherwise open Razorpay for the remaining amount
  const { key_id: keyId, checkout } = data;
  const paymentResponse = await openRazorpayCheckout({ keyId, checkout, onDismiss });
  const verified = await verifyRazorpayPayment(orderId, paymentResponse);
  return verified;
};


export const downloadPaymentInvoice = async (orderId, paymentId) => {
  const response = await apiCall('/orders/payments/invoice', 'POST', {
    order_id: orderId,
    payment_id: paymentId,
  });
  const body = await response.json();

  if (!response.ok || !body.success) {
    throw new Error(body.message || 'Failed to generate invoice');
  }

  return body.data;
};

export const loadWalletMoney = async ({ amount, onDismiss }) => {
  const initResponse = await apiCall('/transactions/load', 'POST', {
    amount: Number(amount),
  });
  const initData = await initResponse.json();

  if (!initResponse.ok || !initData?.success) {
    throw new Error(initData?.message || 'Failed to initiate wallet load');
  }

  const { key_id: keyId, checkout, payment } = initData.data;

  const paymentResponse = await openRazorpayCheckout({
    keyId,
    checkout,
    onDismiss,
  });

  const verifyResponse = await apiCall('/transactions/load/verify', 'POST', {
    razorpay_order_id: paymentResponse.razorpay_order_id,
    razorpay_payment_id: paymentResponse.razorpay_payment_id,
    razorpay_signature: paymentResponse.razorpay_signature,
    payment_id: payment?.payment_id,
  });
  const verifyData = await verifyResponse.json();

  if (!verifyResponse.ok || !verifyData?.success) {
    throw new Error(verifyData?.message || 'Payment verification failed');
  }

  return verifyData.data;
};