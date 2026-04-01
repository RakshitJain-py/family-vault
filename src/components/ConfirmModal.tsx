import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  confirmVariant?: 'primary' | 'danger';
  children?: ReactNode;
}

const ConfirmModal = ({ open, onClose, onConfirm, title, description, confirmLabel = 'Confirm', confirmVariant = 'primary', children }: ConfirmModalProps) => (
  <AnimatePresence>
    {open && (
      <>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-foreground/20 backdrop-blur-sm" onClick={onClose} />
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
          className="fixed left-1/2 top-1/2 z-[101] w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-6 shadow-lg">
          <div className="flex items-start justify-between mb-4">
            <h3 className="font-display text-lg font-semibold">{title}</h3>
            <button onClick={onClose}><X size={18} /></button>
          </div>
          <p className="text-sm text-muted-foreground mb-4">{description}</p>
          {children}
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-secondary transition-colors">Cancel</button>
            <button onClick={onConfirm}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                confirmVariant === 'danger' ? 'border border-danger text-danger hover:bg-danger-bg' : 'bg-primary text-primary-foreground hover:bg-accent-hover'
              }`}>{confirmLabel}</button>
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

export default ConfirmModal;
