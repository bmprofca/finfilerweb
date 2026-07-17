import Button from './Button';
import AnimatedModal from './AnimatedModal';

const sizeClasses = {
  sm: 'max-w-sm max-h-[70vh]',
  md: 'max-w-md max-h-[75vh]',
  lg: 'max-w-lg max-h-[80vh]',
  xl: 'max-w-xl max-h-[90vh]',
  full: 'max-w-full max-h-screen',
};

const Modal = ({ isOpen, onClose, title, children, footer, onConfirm, confirmText = 'Confirm', confirmVariant = 'primary', size = 'md' }) => {
  const sizeClass = sizeClasses[size] || sizeClasses.md;

  return (
    <AnimatedModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth={sizeClass}
      panelClassName="bg-secondary rounded-lg shadow-xl border border-border overflow-hidden flex flex-col"
    >
      <div className="sticky top-0 z-10 flex justify-between items-center px-5 py-4 border-b border-border bg-secondary shrink-0">
        <h3 className="text-xl font-semibold text-primary-foreground">{title}</h3>
        <button
          type="button"
          onClick={onClose}
          className="text-secondary-foreground hover:text-primary-foreground text-2xl leading-none"
        >
          ×
        </button>
      </div>
      <div className="px-5 py-4 overflow-y-auto flex-1 modal-scroll">
        {children}
      </div>
      {footer && (
        <div className="sticky bottom-0 shrink-0 border-t border-border bg-secondary px-5 py-4">
          {footer}
        </div>
      )}
      {onConfirm && (
        <div className="sticky bottom-0 shrink-0 flex justify-end gap-2 px-5 py-4 border-t border-border bg-secondary">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant={confirmVariant} onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
      )}
    </AnimatedModal>
  );
};

export default Modal;
