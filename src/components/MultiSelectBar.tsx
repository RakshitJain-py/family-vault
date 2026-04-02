import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  count: number;
  onDelete: () => void;
}

const MultiSelectBar = ({ count, onDelete }: Props) => (
  <AnimatePresence>
    {count > 0 && (
      <motion.div initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 80 }}
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/90 backdrop-blur-xl px-6 py-3 flex items-center justify-between">
        <span className="text-sm font-medium">{count} selected</span>
        <button onClick={onDelete}
          className="rounded-lg border border-danger px-4 py-2 text-sm font-medium text-danger hover:bg-danger-bg transition-colors">
          Delete Selected
        </button>
      </motion.div>
    )}
  </AnimatePresence>
);

export default MultiSelectBar;
