import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';

const navItems = [
  { label: 'Asset Map', target: '/#asset-map' },
  { label: 'Will Wizard', target: '/will-wizard' },
  { label: 'Recovery Switch', target: '/recovery' },
  { label: 'Legal Help', target: '/legal-help' },
  { label: 'Contact', target: '/#contact' },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAppContext();

  const handleNav = (target: string) => {
    setMobileOpen(false);
    if (target.startsWith('/#')) {
      const id = target.slice(2);
      if (location.pathname === '/') {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      } else {
        navigate('/');
        setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    } else {
      navigate(target);
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4">
          <button onClick={() => handleNav('/#hero')} className="font-display text-xl font-semibold text-foreground">
            Vault
          </button>

          <div className="hidden items-center gap-8 md:flex">
            {navItems.map(item => (
              <button key={item.label} onClick={() => handleNav(item.target)}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/profile')}
              className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium transition-colors hover:bg-secondary">
              <User size={16} />
              <span className="hidden sm:inline">{user.displayName}</span>
            </button>
            <button onClick={() => setMobileOpen(true)} className="md:hidden">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-72 border-l border-border bg-card p-6 shadow-md">
              <button onClick={() => setMobileOpen(false)} className="mb-8"><X size={24} /></button>
              <div className="flex flex-col gap-6">
                {navItems.map(item => (
                  <button key={item.label} onClick={() => handleNav(item.target)}
                    className="text-left text-lg font-medium text-foreground">
                    {item.label}
                  </button>
                ))}
                <button onClick={() => { setMobileOpen(false); navigate('/profile'); }}
                  className="text-left text-lg font-medium text-foreground">Profile</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
