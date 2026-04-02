import { useState, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  initialValues: Record<string, any>;
  onSave: (values: Record<string, any>) => void;
  children: (values: Record<string, any>, setValue: (key: string, val: any) => void) => ReactNode;
}

const AssetDetailPopup = ({ open, onClose, title, subtitle, initialValues, onSave, children }: Props) => {
  const [values, setValues] = useState(initialValues);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setValues(initialValues);
    setDirty(false);
  }, [open]);

  const setValue = (key: string, val: any) => {
    setValues(prev => ({ ...prev, [key]: val }));
    setDirty(true);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-foreground/20 backdrop-blur-sm" onClick={onClose} />
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed z-[101] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[480px] max-h-[80vh] overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-lg
              max-md:left-0 max-md:top-auto max-md:bottom-0 max-md:translate-x-0 max-md:translate-y-0 max-md:rounded-t-2xl max-md:rounded-b-none max-md:max-w-full">
            <div className="flex items-start justify-between mb-1">
              <div>
                <h3 className="font-display text-lg font-semibold">{title}</h3>
                {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
              </div>
              <button onClick={onClose} className="p-1"><X size={18} /></button>
            </div>
            <div className="space-y-4 mt-4">
              {children(values, setValue)}
            </div>
            <div className="flex justify-end mt-6 pt-4 border-t border-border">
              <button onClick={() => { onSave(values); onClose(); }} disabled={!dirty}
                className={`rounded-lg px-5 py-2 text-sm font-medium transition-colors ${dirty ? 'bg-primary text-primary-foreground hover:bg-accent-hover' : 'border border-border text-muted-foreground cursor-not-allowed'}`}>
                Save Changes
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AssetDetailPopup;
