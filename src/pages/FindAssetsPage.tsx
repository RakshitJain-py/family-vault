import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2, User, Heart } from 'lucide-react';

const fadeUp = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

const indianStates = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana',
  'Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur',
  'Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana',
  'Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
  'Andaman and Nicobar Islands','Chandigarh','Dadra and Nagar Haveli and Daman and Diu','Delhi',
  'Jammu and Kashmir','Ladakh','Lakshadweep','Puducherry',
];

const relationships = ['Spouse','Child','Parent','Sibling','Grandchild','Legal Heir','Other'];

const FindAssetsPage = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<'self' | 'deceased' | null>(null);
  const [loading, setLoading] = useState(false);

  // Flow 1 fields
  const [selfForm, setSelfForm] = useState({ fullName: '', dob: '', phone: '', panAadhaar: '' });
  // Flow 2 fields
  const [deceasedForm, setDeceasedForm] = useState({
    fullName: '', dob: '', dod: '', state: '', deathCertFile: '', panAadhaar: '', yourPhone: '', relationship: ''
  });

  const validatePhone = (p: string) => /^[6-9]\d{9}$/.test(p);
  const validatePanAadhaar = (v: string) => /^\d{4}$/.test(v) || /^[A-Z]{5}\d{4}[A-Z]$/.test(v.toUpperCase());

  const selfValid = selfForm.fullName.length >= 2 && selfForm.dob && validatePhone(selfForm.phone) && validatePanAadhaar(selfForm.panAadhaar);
  const deceasedValid = deceasedForm.fullName.length >= 2 && deceasedForm.dob && deceasedForm.dod && deceasedForm.state
    && validatePanAadhaar(deceasedForm.panAadhaar) && validatePhone(deceasedForm.yourPhone) && deceasedForm.relationship;

  const handleSearch = () => {
    setLoading(true);
    setTimeout(() => navigate('/find-assets/results'), 2200);
  };

  const inputClass = "w-full rounded-lg border border-border bg-surface2 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent-light";
  const selectClass = inputClass;

  return (
    <motion.div initial="initial" animate="animate" className="mx-auto max-w-3xl px-4 pt-20 pb-16">
      {!loading ? (
        <>
          <motion.div variants={fadeUp} className="text-center mb-12">
            <h1 className="font-display text-4xl font-semibold mb-4">Find Assets</h1>
            <p className="text-muted-foreground max-w-[520px] mx-auto">
              Locate financial assets across institutions using identity-based matching.
              Vault helps organize results and guides next steps.
              We do not store credentials or access funds.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} className="grid gap-6 md:grid-cols-2 mb-8">
            {[
              { key: 'self' as const, icon: '👤', title: 'Find your own assets', sub: 'Search for active accounts, policies, and investments in your name' },
              { key: 'deceased' as const, icon: '🕊️', title: "Find a late person's assets", sub: 'Locate financial assets belonging to a deceased family member' },
            ].map(card => (
              <button key={card.key} onClick={() => setSelected(card.key)}
                className={`relative rounded-xl border-2 p-6 text-left transition-all ${selected === card.key ? 'border-primary bg-accent-light' : 'border-border bg-card hover:shadow-md hover:border-primary/30'}`}>
                {selected === card.key && <Check size={18} className="absolute top-4 right-4 text-primary" />}
                <span className="text-3xl block mb-3">{card.icon}</span>
                <h3 className="font-display text-lg font-semibold mb-1">{card.title}</h3>
                <p className="text-sm text-muted-foreground">{card.sub}</p>
              </button>
            ))}
          </motion.div>

          <AnimatePresence mode="wait">
            {selected === 'self' && (
              <motion.div key="self" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="rounded-xl border border-border bg-card p-8 max-w-[560px] mx-auto">
                <h3 className="font-semibold text-lg mb-1">Your Identity Details</h3>
                <p className="text-xs text-muted-foreground mb-6">We use these details to match assets across institutions. Nothing is stored.</p>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Full Name <span className="text-danger">*</span></label>
                    <input value={selfForm.fullName} onChange={e => setSelfForm({ ...selfForm, fullName: e.target.value })} className={inputClass} placeholder="Enter your full name" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Date of Birth <span className="text-danger">*</span></label>
                    <input type="date" value={selfForm.dob} onChange={e => setSelfForm({ ...selfForm, dob: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Phone Number <span className="text-danger">*</span></label>
                    <input value={selfForm.phone} onChange={e => setSelfForm({ ...selfForm, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} className={inputClass} placeholder="10-digit number" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">PAN or Aadhaar last 4 digits <span className="text-danger">*</span></label>
                    <input value={selfForm.panAadhaar} onChange={e => setSelfForm({ ...selfForm, panAadhaar: e.target.value.slice(0, 10) })} className={inputClass} placeholder="4-digit Aadhaar or PAN (ABCDE1234F)" />
                  </div>
                  <button onClick={handleSearch} disabled={!selfValid}
                    className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed">
                    Search Assets
                  </button>
                </div>
              </motion.div>
            )}

            {selected === 'deceased' && (
              <motion.div key="deceased" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="rounded-xl border border-border bg-card p-8 max-w-[560px] mx-auto">
                <h3 className="font-semibold text-lg mb-1">Deceased Person's Details</h3>
                <p className="text-xs text-muted-foreground mb-6">Provide details of the person whose assets you are searching for. You will need a death certificate.</p>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Full Name <span className="text-danger">*</span></label>
                    <input value={deceasedForm.fullName} onChange={e => setDeceasedForm({ ...deceasedForm, fullName: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Date of Birth <span className="text-danger">*</span></label>
                    <input type="date" value={deceasedForm.dob} onChange={e => setDeceasedForm({ ...deceasedForm, dob: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Date of Death <span className="text-danger">*</span></label>
                    <input type="date" value={deceasedForm.dod} onChange={e => setDeceasedForm({ ...deceasedForm, dod: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">State of Residence <span className="text-danger">*</span></label>
                    <select value={deceasedForm.state} onChange={e => setDeceasedForm({ ...deceasedForm, state: e.target.value })} className={selectClass}>
                      <option value="">Select state</option>
                      {indianStates.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Death Certificate</label>
                    <label className="flex items-center gap-2 rounded-lg border border-dashed border-border bg-surface2 px-3 py-3 text-sm text-muted-foreground cursor-pointer hover:border-primary/40">
                      📎 {deceasedForm.deathCertFile || 'Upload Death Certificate (optional for search, required for claims)'}
                      <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={e => {
                        const f = e.target.files?.[0];
                        setDeceasedForm({ ...deceasedForm, deathCertFile: f?.name || '' });
                      }} />
                    </label>
                    {deceasedForm.deathCertFile && (
                      <button onClick={() => setDeceasedForm({ ...deceasedForm, deathCertFile: '' })} className="text-xs text-danger mt-1">Remove file</button>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">PAN or Aadhaar last 4 digits <span className="text-danger">*</span></label>
                    <input value={deceasedForm.panAadhaar} onChange={e => setDeceasedForm({ ...deceasedForm, panAadhaar: e.target.value.slice(0, 10) })} className={inputClass} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Your Contact Number <span className="text-danger">*</span></label>
                    <input value={deceasedForm.yourPhone} onChange={e => setDeceasedForm({ ...deceasedForm, yourPhone: e.target.value.replace(/\D/g, '').slice(0, 10) })} className={inputClass} placeholder="10-digit number" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Your Relationship <span className="text-danger">*</span></label>
                    <select value={deceasedForm.relationship} onChange={e => setDeceasedForm({ ...deceasedForm, relationship: e.target.value })} className={selectClass}>
                      <option value="">Select</option>
                      {relationships.map(r => <option key={r}>{r}</option>)}
                    </select>
                  </div>
                  <button onClick={handleSearch} disabled={!deceasedValid}
                    className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed">
                    Search Assets
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-32 text-center">
          <div className="flex gap-1.5 mb-6">
            {[0, 1, 2].map(i => (
              <motion.div key={i} className="h-3 w-3 rounded-full bg-primary"
                animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }} />
            ))}
          </div>
          <h3 className="font-display text-xl font-semibold mb-2">Searching across institutions...</h3>
          <p className="text-sm text-muted-foreground max-w-sm">Checking banks, investments, and insurance records. This may take a moment.</p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default FindAssetsPage;
