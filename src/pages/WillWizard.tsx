import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext, WillData } from '@/context/AppContext';
import { Check, Plus, X, AlertTriangle, Download } from 'lucide-react';
import { inputClass, selectClass, FormField } from '@/components/AssetModal';
import jsPDF from 'jspdf';

const steps = ['Profile', 'Assets', 'Beneficiaries', 'Executor', 'Witnesses', 'Review'];
const categories = ['Real Estate', 'Bank Account', 'Investments', 'Vehicle', 'Jewellery', 'Business Interest', 'Digital Assets', 'Personal Belongings', 'Other'];
const relationOpts = ['Spouse', 'Son', 'Daughter', 'Father', 'Mother', 'Brother', 'Sister', 'Friend', 'Trust', 'Other'];
const religions = ['Hindu', 'Muslim', 'Christian', 'Parsi', 'Other'];
const colors = ['bg-accent', 'bg-warning', 'bg-danger', 'bg-blue-400', 'bg-purple-400', 'bg-pink-400', 'bg-orange-400', 'bg-teal-400', 'bg-yellow-400', 'bg-indigo-400'];

const genId = () => Math.random().toString(36).slice(2, 10);

const WillWizard = () => {
  const { willData, updateWillData, addToast } = useAppContext();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);

  const { profile, assets, beneficiaries, executor, witnesses } = willData;

  const setProfile = (d: Partial<WillData['profile']>) => updateWillData({ profile: { ...profile, ...d } });
  const setExecutor = (d: Partial<WillData['executor']>) => updateWillData({ executor: { ...executor, ...d } });

  const addWillAsset = () => updateWillData({ assets: [...assets, { id: genId(), category: '', name: '', value: '' }] });
  const updateWillAsset = (id: string, d: any) => updateWillData({ assets: assets.map(a => a.id === id ? { ...a, ...d } : a) });
  const removeWillAsset = (id: string) => updateWillData({ assets: assets.filter(a => a.id !== id) });

  const addBeneficiary = () => {
    if (beneficiaries.length >= 10) return;
    updateWillData({ beneficiaries: [...beneficiaries, { id: genId(), fullName: '', relationship: '', allocation: 0, notes: '' }] });
  };
  const updateBeneficiary = (id: string, d: any) => updateWillData({ beneficiaries: beneficiaries.map(b => b.id === id ? { ...b, ...d } : b) });
  const removeBeneficiary = (id: string) => updateWillData({ beneficiaries: beneficiaries.filter(b => b.id !== id) });

  const setWitness = (idx: number, d: any) => {
    const w = [...witnesses];
    w[idx] = { ...w[idx], ...d };
    updateWillData({ witnesses: w });
  };

  const totalAlloc = beneficiaries.reduce((s, b) => s + (b.allocation || 0), 0);

  const canNext = () => {
    if (step === 0) return !!profile.fullName && !!profile.dob;
    if (step === 3) return !!executor.fullName;
    if (step === 4) {
      const w1 = witnesses[0], w2 = witnesses[1];
      if (!w1?.fullName || !w2?.fullName) return false;
      const bnNames = beneficiaries.map(b => b.fullName.toLowerCase());
      if (bnNames.includes(w1.fullName.toLowerCase()) || bnNames.includes(w2.fullName.toLowerCase())) return false;
      return true;
    }
    return true;
  };

  const [allocationWarning, setAllocationWarning] = useState(false);
  const goNext = () => {
    if (step === 2 && totalAlloc < 100 && totalAlloc > 0) { setAllocationWarning(true); return; }
    if (step < 5) { setDir(1); setStep(s => s + 1); }
    if (step === 5) { updateWillData({ finalized: true }); addToast('Will finalized!'); }
  };
  const goBack = () => { setDir(-1); setStep(s => s - 1); };

  const generatePDF = useCallback(() => {
    const doc = new jsPDF();
    let y = 20;
    const addLine = (text: string, size = 11, bold = false) => {
      doc.setFontSize(size);
      if (bold) doc.setFont('helvetica', 'bold'); else doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(text, 170);
      if (y + lines.length * 6 > 280) { doc.addPage(); y = 20; }
      doc.text(lines, 20, y);
      y += lines.length * 6 + 2;
    };
    const addFooter = () => {
      doc.setFontSize(8); doc.setFont('helvetica', 'italic');
      doc.text('This document was drafted using Vault, an organizational drafting assistant. This is not a legally certified document.', 20, 285);
    };

    addLine('LAST WILL AND TESTAMENT', 18, true);
    addLine('Drafted via Vault — Organizational Drafting Assistant', 10);
    y += 8;
    addLine('TESTATOR DETAILS', 14, true);
    addLine(`Name: ${profile.fullName || 'N/A'}`);
    addLine(`Date of Birth: ${profile.dob || 'N/A'}`);
    addLine(`City: ${profile.city || 'N/A'}`);
    addLine(`Religion / Personal Law: ${profile.religion || 'N/A'}`);
    y += 6;
    addLine('ASSETS', 14, true);
    assets.forEach((a, i) => addLine(`${i + 1}. ${a.category} — ${a.name}${a.value ? ` (Value: ${a.value})` : ''}`));
    if (assets.length === 0) addLine('No assets declared.');
    y += 6;
    addLine('BENEFICIARIES', 14, true);
    beneficiaries.forEach(b => addLine(`• ${b.fullName} (${b.relationship}) — ${b.allocation}%${b.notes ? ` — ${b.notes}` : ''}`));
    y += 6;
    addLine('EXECUTOR', 14, true);
    addLine(`Name: ${executor.fullName || 'N/A'}`);
    if (executor.phone) addLine(`Phone: ${executor.phone}`);
    if (executor.altEnabled && executor.altFullName) { addLine('Alternate Executor:', 11, true); addLine(`Name: ${executor.altFullName}`); }
    y += 6;
    addLine('WITNESSES', 14, true);
    witnesses.forEach((w, i) => w?.fullName && addLine(`Witness ${i + 1}: ${w.fullName}, Age ${w.age || 'N/A'}, ${w.address || 'N/A'}`));
    y += 10;
    addLine('DECLARATION', 14, true);
    const age = profile.dob ? Math.floor((Date.now() - new Date(profile.dob).getTime()) / 31557600000) : '__';
    addLine(`I, ${profile.fullName || '___'}, aged ${age} years, residing at ${profile.city || '___'}, declare this to be my last will and testament, made on this day, and revoke all previous wills.`);
    y += 10;
    addLine('Signed: ___________________     Date: ___________');
    addFooter();
    doc.save('vault-will-draft.pdf');
    updateWillData({ downloaded: true });
    addToast('Will draft downloaded. Please review with a legal professional.');
  }, [profile, assets, beneficiaries, executor, witnesses, addToast, updateWillData]);

  const witnessMatchesBeneficiary = (name: string) => {
    if (!name) return false;
    return beneficiaries.some(b => b.fullName.toLowerCase() === name.toLowerCase());
  };

  const executorMatchesBeneficiary = executor.fullName && beneficiaries.some(b => b.fullName.toLowerCase() === executor.fullName!.toLowerCase());

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-[680px] px-4 pt-20 pb-16">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-glow md:p-8">
        {/* Stepper */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((s, i) => (
            <button key={s} onClick={() => i < step && setStep(i)}
              className={`flex flex-col items-center gap-1 ${i <= step ? 'text-accent' : 'text-muted-foreground'}`}>
              <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                i < step ? 'bg-accent text-primary-foreground' : i === step ? 'border-2 border-accent text-accent' : 'border border-border'
              }`}>{i < step ? <Check size={14} /> : i + 1}</span>
              <span className="text-[10px] font-medium hidden sm:block">{s}</span>
            </button>
          ))}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: dir * 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: dir * -20 }}
            transition={{ duration: 0.2 }} className="min-h-[300px]">
            
            {step === 0 && (
              <div className="space-y-4">
                <h2 className="font-display text-xl font-semibold">Your Profile</h2>
                <FormField label="Full Name" required>
                  <input value={profile.fullName || ''} onChange={e => setProfile({ fullName: e.target.value })} className={inputClass} />
                </FormField>
                <FormField label="Date of Birth" required>
                  <input type="date" value={profile.dob || ''} onChange={e => setProfile({ dob: e.target.value })} className={inputClass} />
                </FormField>
                <FormField label="Aadhaar Last 4 Digits">
                  <div className="relative">
                    <input value={profile.aadhaarLast4 || ''} onChange={e => setProfile({ aadhaarLast4: e.target.value.replace(/\D/g, '').slice(0, 4) })} className={inputClass} maxLength={4} />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground cursor-help" title="We only store last 4 digits for identification. Never the full Aadhaar.">ℹ️</span>
                  </div>
                </FormField>
                <FormField label="City of Residence">
                  <input value={profile.city || ''} onChange={e => setProfile({ city: e.target.value })} className={inputClass} />
                </FormField>
                <FormField label="Religion / Personal Law">
                  <select value={profile.religion || ''} onChange={e => setProfile({ religion: e.target.value })} className={selectClass}>
                    <option value="">Select</option>
                    {religions.map(r => <option key={r}>{r}</option>)}
                  </select>
                </FormField>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <h2 className="font-display text-xl font-semibold">Declare Assets</h2>
                {assets.length === 0 && (
                  <div className="rounded-lg border border-warning-bg bg-warning-bg p-4 text-sm text-warning">
                    You haven't declared any assets. You can still continue, but a will without asset declarations may have limited legal effect.
                  </div>
                )}
                {assets.map(a => (
                  <div key={a.id} className="flex gap-3 items-start">
                    <select value={a.category} onChange={e => updateWillAsset(a.id, { category: e.target.value })} className={selectClass + ' w-40 shrink-0'}>
                      <option value="">Category</option>
                      {categories.map(c => <option key={c}>{c}</option>)}
                    </select>
                    <input value={a.name} onChange={e => updateWillAsset(a.id, { name: e.target.value })} placeholder="Description" className={inputClass} />
                    <input value={a.value || ''} onChange={e => updateWillAsset(a.id, { value: e.target.value })} placeholder="Value" className={inputClass + ' w-28 shrink-0'} />
                    <button onClick={() => removeWillAsset(a.id)} className="p-2 text-danger hover:bg-danger-bg rounded shrink-0"><X size={16} /></button>
                  </div>
                ))}
                <button onClick={addWillAsset} className="flex items-center gap-1 text-sm font-medium text-accent hover:underline"><Plus size={14} /> Add Asset</button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h2 className="font-display text-xl font-semibold">Beneficiaries</h2>
                {/* Allocation bar */}
                {beneficiaries.length > 0 && (
                  <div>
                    <div className="flex h-4 rounded-full overflow-hidden border border-border">
                      {beneficiaries.map((b, i) => b.allocation > 0 && (
                        <div key={b.id} className={`${colors[i % colors.length]}`} style={{ width: `${Math.min(b.allocation, 100)}%` }}
                          title={`${b.fullName}: ${b.allocation}%`} />
                      ))}
                    </div>
                    <div className={`text-xs mt-1 ${totalAlloc > 100 ? 'text-danger' : totalAlloc === 100 ? 'text-accent' : 'text-muted-foreground'}`}>
                      {totalAlloc > 100 ? `⚠ Allocation exceeds 100% (${totalAlloc}%). Please adjust.` :
                       totalAlloc === 100 ? '✓ Fully allocated' : `Total: ${totalAlloc}% — ${100 - totalAlloc}% remaining`}
                    </div>
                  </div>
                )}
                {beneficiaries.map(b => (
                  <div key={b.id} className="rounded-lg border border-border p-4 space-y-3">
                    <div className="flex gap-3 items-start">
                      <input value={b.fullName} onChange={e => updateBeneficiary(b.id, { fullName: e.target.value })} placeholder="Full Name *" className={inputClass} />
                      <select value={b.relationship} onChange={e => updateBeneficiary(b.id, { relationship: e.target.value })} className={selectClass + ' w-36 shrink-0'}>
                        <option value="">Relation</option>
                        {relationOpts.map(r => <option key={r}>{r}</option>)}
                      </select>
                      <input type="number" min={0} max={100} value={b.allocation || ''} onChange={e => updateBeneficiary(b.id, { allocation: Number(e.target.value) })} placeholder="%" className={inputClass + ' w-20 shrink-0'} />
                      <button onClick={() => removeBeneficiary(b.id)} className="p-2 text-danger hover:bg-danger-bg rounded shrink-0"><X size={16} /></button>
                    </div>
                    <input value={b.notes || ''} onChange={e => updateBeneficiary(b.id, { notes: e.target.value })} placeholder="Notes (e.g., the flat in Delhi)" className={inputClass} />
                  </div>
                ))}
                {beneficiaries.length < 10 && (
                  <button onClick={addBeneficiary} className="flex items-center gap-1 text-sm font-medium text-accent hover:underline"><Plus size={14} /> Add Beneficiary</button>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h2 className="font-display text-xl font-semibold">Executor</h2>
                <div className="rounded-lg border border-border bg-secondary p-4 text-sm text-muted-foreground">
                  An executor carries out the instructions in your will — collecting assets, paying debts, and distributing to beneficiaries. Choose someone you trust deeply.
                </div>
                {executorMatchesBeneficiary && (
                  <div className="rounded-lg border border-warning bg-warning-bg p-3 text-sm text-warning flex items-start gap-2">
                    <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                    This person is also listed as a beneficiary. While legally allowed, this may create conflicts.
                  </div>
                )}
                <FormField label="Full Name" required>
                  <input value={executor.fullName || ''} onChange={e => setExecutor({ fullName: e.target.value })} className={inputClass} />
                </FormField>
                <FormField label="Phone Number">
                  <input value={executor.phone || ''} onChange={e => setExecutor({ phone: e.target.value })} className={inputClass} />
                </FormField>
                <FormField label="Email">
                  <input value={executor.email || ''} onChange={e => setExecutor({ email: e.target.value })} className={inputClass} />
                </FormField>
                <FormField label="Relationship">
                  <select value={executor.relationship || ''} onChange={e => setExecutor({ relationship: e.target.value })} className={selectClass}>
                    <option value="">Select</option>
                    {relationOpts.map(r => <option key={r}>{r}</option>)}
                  </select>
                </FormField>
                <div className="flex items-center gap-3">
                  <button onClick={() => setExecutor({ altEnabled: !executor.altEnabled })}
                    className={`relative h-6 w-10 rounded-full transition-colors ${executor.altEnabled ? 'bg-accent' : 'bg-border'}`}>
                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-card shadow transition-transform ${executor.altEnabled ? 'left-[18px]' : 'left-0.5'}`} />
                  </button>
                  <span className="text-sm">Add Alternate Executor</span>
                </div>
                {executor.altEnabled && (
                  <div className="space-y-4 pl-4 border-l-2 border-accent-light">
                    <FormField label="Alt. Full Name">
                      <input value={executor.altFullName || ''} onChange={e => setExecutor({ altFullName: e.target.value })} className={inputClass} />
                    </FormField>
                    <FormField label="Alt. Phone">
                      <input value={executor.altPhone || ''} onChange={e => setExecutor({ altPhone: e.target.value })} className={inputClass} />
                    </FormField>
                  </div>
                )}
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <h2 className="font-display text-xl font-semibold">Witnesses</h2>
                <div className="rounded-lg border border-warning bg-warning-bg p-4 text-sm text-warning">
                  <p className="font-semibold">⚠️ Legal Requirement</p>
                  <p className="mt-1">Witnesses cannot be beneficiaries under this will. They must be adults (18+), of sound mind, and present at the time of signing.</p>
                </div>
                {[0, 1].map(i => (
                  <div key={i} className="space-y-3">
                    <h3 className="font-semibold text-sm">Witness {i + 1}</h3>
                    {witnessMatchesBeneficiary(witnesses[i]?.fullName || '') && (
                      <p className="text-xs text-danger">{witnesses[i]?.fullName} is listed as a beneficiary and cannot be a witness.</p>
                    )}
                    <FormField label="Full Name" required>
                      <input value={witnesses[i]?.fullName || ''} onChange={e => setWitness(i, { fullName: e.target.value })} className={inputClass} />
                    </FormField>
                    <div className="grid grid-cols-2 gap-3">
                      <FormField label="Age (18+)">
                        <input type="number" min={18} value={witnesses[i]?.age || ''} onChange={e => setWitness(i, { age: Number(e.target.value) })} className={inputClass} />
                      </FormField>
                      <FormField label="Relationship">
                        <input value={witnesses[i]?.relationship || ''} onChange={e => setWitness(i, { relationship: e.target.value })} className={inputClass} />
                      </FormField>
                    </div>
                    <FormField label="Address">
                      <input value={witnesses[i]?.address || ''} onChange={e => setWitness(i, { address: e.target.value })} className={inputClass} />
                    </FormField>
                  </div>
                ))}
              </div>
            )}

            {step === 5 && (
              <div className="space-y-4">
                <h2 className="font-display text-xl font-semibold">Review & Finalize</h2>
                <div className="rounded-xl border border-border p-6 font-display text-sm leading-relaxed" style={{ background: '#FFFEF7' }}>
                  <h3 className="text-center text-lg font-bold mb-4">LAST WILL AND TESTAMENT</h3>
                  <div className="space-y-4">
                    <div><p className="font-semibold">Testator:</p><p>{profile.fullName}, DOB: {profile.dob}, {profile.city}</p></div>
                    <div><p className="font-semibold">Assets:</p>{assets.map((a, i) => <p key={a.id}>{i + 1}. {a.category} — {a.name}{a.value ? ` (${a.value})` : ''}</p>)}{assets.length === 0 && <p className="text-muted-foreground">None declared</p>}</div>
                    <div><p className="font-semibold">Beneficiaries:</p>{beneficiaries.map(b => <p key={b.id}>• {b.fullName} ({b.relationship}) — {b.allocation}%{b.notes ? ` — ${b.notes}` : ''}</p>)}</div>
                    <div><p className="font-semibold">Executor:</p><p>{executor.fullName}{executor.relationship ? ` (${executor.relationship})` : ''}</p></div>
                    <div><p className="font-semibold">Witnesses:</p>{witnesses.map((w, i) => w?.fullName && <p key={i}>Witness {i + 1}: {w.fullName}, Age {w.age || 'N/A'}</p>)}</div>
                    <hr className="border-border" />
                    <p className="italic">I, {profile.fullName || '___'}, declare this to be my last will and testament, made on this day, and revoke all previous wills.</p>
                    <p className="mt-4">Signed: ___________________&nbsp;&nbsp;&nbsp;&nbsp;Date: ___________</p>
                  </div>
                </div>
                <button onClick={generatePDF} className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-accent-hover transition-colors w-full justify-center">
                  <Download size={18} /> Download Legal PDF
                </button>
                {willData.downloaded && (
                  <div className="rounded-xl border border-border bg-card p-5 space-y-3">
                    <h4 className="font-semibold text-sm">Post-Download Checklist</h4>
                    {[
                      'Print on plain white A4 paper (do not use stamp paper)',
                      'Sign at the bottom of every page',
                      'Have both witnesses sign the final page in your presence',
                      'Store the signed original in a safe location',
                      'Consider uploading a scanned copy to Vault for your records',
                      'Consult a lawyer to have the will registered (optional but recommended)',
                    ].map((item, i) => (
                      <label key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <input type="checkbox" className="mt-1 accent-accent" /> {item}
                      </label>
                    ))}
                    <p className="text-xs text-muted-foreground mt-4">Vault acts as a drafting assistant only. This document has no legal force until properly signed, witnessed, and ideally registered.</p>
                  </div>
                )}
                <button onClick={() => { setDir(-1); setStep(0); }} className="text-sm text-accent hover:underline">← Edit Will</button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Allocation warning modal */}
        {allocationWarning && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/20 backdrop-blur-sm">
            <div className="rounded-xl border border-border bg-card p-6 max-w-sm">
              <p className="text-sm mb-4">Total is {totalAlloc}%. Remaining {100 - totalAlloc}% will be treated as undistributed. Continue?</p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setAllocationWarning(false)} className="rounded-lg border border-border px-4 py-2 text-sm">Go back</button>
                <button onClick={() => { setAllocationWarning(false); setDir(1); setStep(s => s + 1); }} className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground">Yes, continue</button>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        {step < 5 && (
          <div className="flex justify-between mt-8 pt-4 border-t border-border">
            {step > 0 ? <button onClick={goBack} className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-secondary">Back</button> : <div />}
            <button onClick={goNext} disabled={!canNext()}
              className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-accent-hover disabled:opacity-50 transition-colors">
              {step === 4 ? 'Review' : 'Next'}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default WillWizard;
