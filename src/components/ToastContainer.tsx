import { AnimatePresence, motion } from 'framer-motion';
import { useAppContext } from '@/context/AppContext';
import { X, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

const icons = { success: CheckCircle, warning: AlertTriangle, error: XCircle };
const colors = {
  success: 'border-accent bg-accent-light text-accent',
  warning: 'border-warning bg-warning-bg text-warning',
  error: 'border-danger bg-danger-bg text-danger',
};

const ToastContainer = () => {
  const { toasts, removeToast } = useAppContext();
  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3">
      <AnimatePresence>
        {toasts.map(t => {
          const Icon = icons[t.type];
          return (
            <motion.div key={t.id} initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className={`flex items-center gap-3 rounded-lg border px-4 py-3 shadow-md ${colors[t.type]}`}>
              <Icon size={18} />
              <span className="text-sm font-medium">{t.message}</span>
              <button onClick={() => removeToast(t.id)} className="ml-2"><X size={14} /></button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
