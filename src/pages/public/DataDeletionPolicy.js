import React from 'react';
import LegalLayout from '../../components/public/LegalLayout';

export default function DataDeletionPolicy() {
  return (
    <LegalLayout title="Data Deletion Policy" description="Learn how you can request data deletion." lastUpdated="July 20, 2023">
      <h2>1. Your Right to Deletion</h2>
      <p>Under applicable data protection laws, you have the right to request the deletion of your personal data held by FinFiler, subject to certain exceptions. We are committed to processing your request promptly and transparently.</p>

      <h2>2. How to Request Deletion</h2>
      <p>To request the deletion of your data, you must submit a written request via email to support@finfiler.com from the email address associated with your account. We may ask for additional verification to ensure the request is valid.</p>

      <h2>3. Exceptions to Deletion</h2>
      <p>We may deny your deletion request if retaining the information is necessary for us or our service providers to:</p>
      <ul>
        <li>Complete the transaction for which we collected the personal information.</li>
        <li>Detect security incidents, protect against malicious, deceptive, fraudulent, or illegal activity.</li>
        <li>Comply with a legal obligation, such as maintaining tax records or compliance documentation required by government authorities.</li>
      </ul>

      <h2>4. Deletion Process</h2>
      <p>Once we receive and confirm your verifiable consumer request, we will delete (and direct our service providers to delete) your personal information from our records, unless an exception applies. This process may take up to 30 days.</p>
    </LegalLayout>
  );
}
