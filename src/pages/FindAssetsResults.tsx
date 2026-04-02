import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, ChevronDown } from 'lucide-react';

const fadeUp = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

const categories = [
  { key: 'banks', emoji: '🏦', label: 'Banks' },
  { key: 'stocks', emoji: '📈', label: 'Stocks' },
  { key: 'insurance', emoji: '🛡️', label: 'Insurance' },
];

const placeholderResults: Record<string, { name: string; type: string; status: string; color: string }[]> = {
  banks: [
    { name: 'HDFC Bank', type: 'Savings Account', status: 'Active', color: 'bg-accent' },
    { name: 'SBI', type: 'Fixed Deposit', status: 'Dormant', color: 'bg-warning' },
    { name: 'ICICI Bank', type: 'Savings Account', status: 'Unclaimed', color: 'bg-danger' },
  ],
  stocks: [
    { name: 'Zerodha', type: 'Equity Holdings', status: 'Active', color: 'bg-accent' },
    { name: 'Physical Shares (Legacy)', type: 'Legacy', status: 'Unclaimed', color: 'bg-danger' },
    { name: 'Employee ESOP Holdings', type: 'ESOP', status: 'Pending', color: 'bg-border' },
  ],
  insurance: [
    { name: 'LIC', type: 'Endowment Policy', status: 'Active', color: 'bg-accent' },
    { name: 'HDFC Life', type: 'Term Plan', status: 'Active', color: 'bg-accent' },
    { name: 'Star Health', type: 'Health Insurance', status: 'Lapsed', color: 'bg-danger' },
  ],
};

const officialSources = [
  { emoji: '🏦', name: 'RBI — Unclaimed Bank Deposits', desc: 'Search for dormant or unclaimed bank accounts', url: 'https://udgam.rbi.org.in/' },
  { emoji: '📈', name: 'IEPF — Unclaimed Shares & Dividends', desc: 'Recover shares or dividends transferred to IEPF', url: 'https://www.iepf.gov.in/content/iepf/global/master/Home/Home.html' },
  { emoji: '🛡️', name: 'IRDAI — Unclaimed Insurance', desc: 'Search for unclaimed insurance amounts', url: 'https://bimabharosa.irdai.gov.in/Home/UnclaimedAmountsQuery' },
];

const FindAssetsResults = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showSources, setShowSources] = useState(false);

  const toggleCategory = (key: string) => setActiveCategory(prev => prev === key ? null : key);

  return (
    <motion.div initial="initial" animate="animate" className="mx-auto max-w-4xl px-4 pt-20 pb-16">
      <motion.div variants={fadeUp} className="text-center mb-12">
        <h1 className="font-display text-4xl font-semibold mb-3">Assets Located</h1>
        <p className="text-muted-foreground">Vault organizes discovered asset trails and guides your next steps.</p>
      </motion.div>

      <motion.div variants={fadeUp} className="grid gap-6 md:grid-cols-3 mb-8">
        {categories.map(cat => (
          <button key={cat.key} onClick={() => toggleCategory(cat.key)}
            className={`rounded-xl border-2 p-5 text-left transition-all ${activeCategory === cat.key ? 'border-primary bg-accent-light' : 'border-border bg-card hover:shadow-md'}`}>
            <span className="text-2xl block mb-2">{cat.emoji}</span>
            <h3 className="font-display text-lg font-semibold">{cat.label}</h3>
          </button>
        ))}
      </motion.div>

      <AnimatePresence mode="wait">
        {activeCategory && (
          <motion.div key={activeCategory} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <div className="border-t border-border pt-6 mb-6">
              <h3 className="font-semibold text-lg">Assets found on Vault</h3>
            </div>
            <div className="grid gap-4">
              {placeholderResults[activeCategory].map((item, i) => (
                <div key={i} className="rounded-xl border border-border bg-card p-5 shadow-sm flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{item.name}</h4>
                    <span className="mt-1 inline-block rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium">{item.type}</span>
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${item.color}`} />
                      <span className="text-xs text-muted-foreground">{item.status}</span>
                    </div>
                  </div>
                  <button onClick={() => navigate('/under-dev')} className="text-sm font-medium text-primary hover:underline">
                    View Guidance →
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div variants={fadeUp} className="mt-12 rounded-xl border border-border bg-card p-6 text-center">
        <h3 className="font-semibold mb-1">Not found what you're looking for?</h3>
        <p className="text-sm text-muted-foreground mb-4">Check directly with official government sources.</p>
        <button onClick={() => setShowSources(!showSources)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-accent-hover transition-colors">
          Check Official Sources <ChevronDown size={16} className={`transition-transform ${showSources ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {showSources && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="mt-6 overflow-hidden">
              <div className="grid gap-4 md:grid-cols-3 text-left">
                {officialSources.map((s, i) => (
                  <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                    className="rounded-lg border border-border bg-surface2 p-4 hover:shadow-md transition-shadow group">
                    <span className="text-xl block mb-2">{s.emoji}</span>
                    <h4 className="font-semibold text-sm mb-1 group-hover:text-primary">{s.name}</h4>
                    <p className="text-xs text-muted-foreground mb-2">{s.desc}</p>
                    <span className="inline-flex items-center gap-1 text-xs text-primary"><ExternalLink size={12} /> Visit</span>
                  </a>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Vault helps organize your discovery process. Official verification and claims are handled directly by the respective authorities.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default FindAssetsResults;
