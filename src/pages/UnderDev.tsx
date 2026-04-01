import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UnderDev = () => {
  const navigate = useNavigate();
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="flex min-h-screen flex-col items-center justify-center px-4 pt-14">
      <span className="text-6xl mb-6">🔧</span>
      <h1 className="font-display text-3xl font-semibold mb-3">Under Development</h1>
      <p className="text-muted-foreground text-center max-w-md mb-8">
        This feature is being crafted with care. We'll let you know when it's ready.
      </p>
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-secondary transition-colors">
        <ArrowLeft size={16} /> Go Back
      </button>
    </motion.div>
  );
};

export default UnderDev;
