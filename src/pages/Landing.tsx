import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, TrendingUp, Shield, Plus, Eye, Lock, Handshake } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';

const stagger = { animate: { transition: { staggerChildren: 0.07 } } };
const fadeUp = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

const Landing = () => {
  const navigate = useNavigate();
  const { assets, addToast } = useAppContext();

  const categories = [
    { key: 'banks' as const, emoji: '🏦', title: 'Banks', desc: 'Savings accounts, FDs, recurring deposits, lockers', route: '/assets/banks' },
    { key: 'stocks' as const, emoji: '📈', title: 'Stocks & Investments', desc: 'Demat accounts, shares, broker accounts, ESOPs, mutual funds', route: '/assets/stocks' },
    { key: 'insurance' as const, emoji: '🛡️', title: 'Insurance', desc: 'Life, health, motor, term, and ULIP policies', route: '/assets/insurance' },
  ];

  const values = [
    { icon: Eye, title: 'Find what you own', body: "Families often discover assets months after a loved one passes. Vault maps everything in one place before that moment arrives." },
    { icon: Lock, title: 'Organized, not exposed', body: "No passwords. No banking access. Only the information your family needs to begin the process." },
    { icon: Handshake, title: 'Guidance when it matters', body: "Vault contacts your trusted person only after careful verification—never automatically, never without consent." },
  ];

  const handleContactSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    addToast("Message received. We'll be in touch.", 'success');
    (e.target as HTMLFormElement).reset();
  };

  return (
    <motion.div initial="initial" animate="animate" variants={stagger}>
      {/* Hero */}
      <section id="hero" className="relative flex min-h-screen flex-col items-center justify-center px-4 pt-14 dot-grid">
        <motion.div variants={stagger} className="text-center max-w-2xl">
          <motion.h1 variants={fadeUp} className="font-display text-5xl font-semibold text-foreground md:text-[64px] leading-[1.1] mb-6">
            Everything your family needs.<br />Already organized.
          </motion.h1>
          <motion.p variants={fadeUp} className="text-lg text-muted-foreground max-w-[480px] mx-auto mb-10">
            Vault quietly maps your financial life so recovery becomes simple, not stressful.
          </motion.p>
          <motion.div variants={fadeUp}>
            <motion.button
              onClick={() => navigate('/find-assets')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="rounded-lg bg-primary px-10 py-3.5 text-base font-medium text-primary-foreground hover:bg-accent-hover transition-colors">
              Find Assets
            </motion.button>
          </motion.div>
        </motion.div>
      </section>

      {/* Asset Map */}
      <section id="asset-map" className="mx-auto max-w-6xl px-4 py-24">
        <motion.div variants={fadeUp} className="mb-12">
          <h2 className="font-display text-3xl font-semibold mb-2">Asset Map</h2>
          <p className="text-muted-foreground">Your financial universe, organized by category.</p>
        </motion.div>
        <div className="grid gap-6 md:grid-cols-3">
          {categories.map(cat => {
            const count = assets[cat.key].length;
            return (
              <motion.div key={cat.key} variants={fadeUp} whileHover={{ scale: 1.015, boxShadow: 'var(--shadow-md)' }}
                onClick={() => navigate(cat.route)}
                className="relative cursor-pointer rounded-xl border border-border bg-card p-6 shadow-sm transition-all">
                <div className="absolute top-4 right-4">
                  {count > 0 ? (
                    <span className="rounded-full bg-accent-light px-2.5 py-0.5 text-xs font-medium text-primary">{count} asset{count !== 1 ? 's' : ''}</span>
                  ) : (
                    <span className="text-xs text-muted-foreground">No assets yet</span>
                  )}
                </div>
                <span className="text-3xl mb-4 block">{cat.emoji}</span>
                <h3 className="font-display text-xl font-semibold mb-2">{cat.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{cat.desc}</p>
                <span className="flex items-center gap-1 text-sm font-medium text-primary">
                  <Plus size={14} /> Add →
                </span>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Value Section */}
      <section className="mx-auto max-w-6xl px-4 py-24">
        <div className="grid gap-6 md:grid-cols-3 mb-12">
          {values.map((v, i) => (
            <motion.div key={i} variants={fadeUp} className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <v.icon size={28} className="text-primary mb-4" />
              <h3 className="font-display text-lg font-semibold mb-2">{v.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{v.body}</p>
            </motion.div>
          ))}
        </div>
        <motion.div variants={fadeUp} className="rounded-xl border border-border bg-secondary p-6 text-center">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Vault is not a bank. Not a lawyer. Not a custodian.</strong><br />
            We are a calm, organized guide for one of life's most difficult moments.
          </p>
        </motion.div>
      </section>

      {/* Contact / Footer */}
      <section id="contact" className="border-t border-border bg-secondary">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="grid gap-12 md:grid-cols-3">
            <div>
              <h3 className="font-display text-xl font-semibold mb-3">Vault</h3>
              <p className="text-sm text-muted-foreground mb-4">Organize your financial life. For the people you love.</p>
              <p className="text-xs text-muted-foreground">© 2025 Vault. All rights reserved.</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4">Links</h4>
              <div className="flex flex-col gap-2">
                <button onClick={() => document.getElementById('asset-map')?.scrollIntoView({ behavior: 'smooth' })} className="text-sm text-muted-foreground hover:text-foreground text-left">Asset Map</button>
                <button onClick={() => navigate('/will-wizard')} className="text-sm text-muted-foreground hover:text-foreground text-left">Will Wizard</button>
                <button onClick={() => navigate('/recovery')} className="text-sm text-muted-foreground hover:text-foreground text-left">Recovery Switch</button>
                <button onClick={() => navigate('/privacy')} className="text-sm text-muted-foreground hover:text-foreground text-left">Privacy Policy</button>
                <button onClick={() => navigate('/terms')} className="text-sm text-muted-foreground hover:text-foreground text-left">Terms of Use</button>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4">Get in Touch</h4>
              <form onSubmit={handleContactSubmit} className="flex flex-col gap-3">
                <input required placeholder="Name" className="rounded-lg border border-border bg-surface2 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent-light" />
                <input required type="email" placeholder="Email" className="rounded-lg border border-border bg-surface2 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent-light" />
                <textarea required placeholder="Message" rows={3} className="rounded-lg border border-border bg-surface2 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent-light resize-none" />
                <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-accent-hover transition-colors">
                  Send Message
                </button>
              </form>
            </div>
          </div>
          <p className="mt-12 text-center text-xs text-muted-foreground max-w-3xl mx-auto">
            Vault is an organizational assistant and drafting aid. Vault does not provide legal advice, financial services, asset custody, or any regulated financial activity. All content on this platform is for informational and organizational purposes only. Please consult a qualified legal professional for matters relating to wills and estate planning.
          </p>
        </div>
      </section>
    </motion.div>
  );
};

export default Landing;
