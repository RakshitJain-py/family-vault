import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface AssetModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  onSave: () => void;
  saveLabel?: string;
}

const AssetModal = ({ open, onClose, title, children, onSave, saveLabel = 'Save Asset' }: AssetModalProps) => (
  <AnimatePresence>
    {open && (
      <>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-foreground/20 backdrop-blur-sm" onClick={onClose} />
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
          className="fixed inset-x-0 bottom-0 z-[101] max-h-[90vh] overflow-y-auto rounded-t-2xl border-t border-border bg-card p-6 shadow-lg md:left-1/2 md:top-1/2 md:bottom-auto md:w-full md:max-w-lg md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-2xl md:border">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display text-lg font-semibold">{title}</h3>
            <button onClick={onClose}><X size={18} /></button>
          </div>
          <div className="space-y-4">{children}</div>
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
            <button onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-secondary transition-colors">Cancel</button>
            <button onClick={onSave} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-accent-hover transition-colors">{saveLabel}</button>
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

export default AssetModal;

export const FormField = ({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) => (
  <div>
    <label className="text-sm font-medium text-foreground mb-1 block">
      {label} {required && <span className="text-danger">*</span>}
    </label>
    {children}
  </div>
);

export const inputClass = "w-full rounded-lg border border-border bg-surface2 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent-light";
export const selectClass = "w-full rounded-lg border border-border bg-surface2 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent-light";
