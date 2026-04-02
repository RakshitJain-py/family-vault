import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, FileText } from 'lucide-react';
import { useAppContext, InsuranceAsset } from '@/context/AppContext';
import AssetModal, { FormField, inputClass, selectClass } from '@/components/AssetModal';
import AssetDetailPopup from '@/components/AssetDetailPopup';
import MultiSelectBar from '@/components/MultiSelectBar';
import ConfirmModal from '@/components/ConfirmModal';
import { deslugify, slugify } from '@/lib/slugify';

const fadeUp = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };
const policyTypes = ['Term Life', 'Health', 'Motor', 'ULIP', 'Endowment', 'Critical Illness', 'Personal Accident', 'Other'];
const frequencies = ['Monthly', 'Quarterly', 'Half-Yearly', 'Yearly'];
const relations = ['Spouse', 'Child', 'Parent', 'Sibling', 'Other'];

const InsuranceDetailPage = () => {
  const navigate = useNavigate();
  const { insurerSlug } = useParams<{ insurerSlug: string }>();
  const { assets, addAsset, updateAsset, deleteAsset, addToast } = useAppContext();
  const insurerName = deslugify(insurerSlug || '');
  const insurerAssets = assets.insurance.filter(a => slugify(a.insurerName) === insurerSlug);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<Partial<InsuranceAsset>>({ insurerName });
  const [detailAsset, setDetailAsset] = useState<InsuranceAsset | null>(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const toggleSelect = (id: string) => { const n = new Set(selected); n.has(id) ? n.delete(id) : n.add(id); setSelected(n); };

  const handleSave = () => {
    if (!form.policyType || !form.policyNumber) { addToast('Please fill required fields', 'warning'); return; }
    addAsset('insurance', { ...form, insurerName });
    addToast('Asset added'); setModalOpen(false);
  };

  const handleBulkDelete = () => {
    selected.forEach(id => deleteAsset('insurance', id));
    addToast(`${selected.size} assets deleted`, 'warning');
    setSelected(new Set()); setSelectMode(false); setBulkDeleteOpen(false);
  };

  return (
    <motion.div initial="initial" animate="animate" className="mx-auto max-w-4xl px-4 pt-20 pb-16">
      <motion.div variants={fadeUp} className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/assets/insurance')} className="rounded-lg border border-border p-2 hover:bg-secondary"><ArrowLeft size={18} /></button>
          <h1 className="font-display text-2xl font-semibold">{insurerName}</h1>
          <span className="rounded-full bg-accent-light px-2.5 py-0.5 text-xs font-medium text-primary">{insurerAssets.length} assets</span>
        </div>
        <div className="flex items-center gap-2">
          {insurerAssets.length > 0 && (
            <button onClick={() => { setSelectMode(!selectMode); setSelected(new Set()); }}
              className="rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-secondary">{selectMode ? 'Cancel' : 'Select'}</button>
          )}
          <button onClick={() => { setForm({ insurerName }); setModalOpen(true); }}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-accent-hover">
            <Plus size={16} /> Add Asset
          </button>
        </div>
      </motion.div>

      {insurerAssets.length === 0 ? (
        <motion.div variants={fadeUp} className="flex flex-col items-center py-20 text-center">
          <p className="font-display text-lg font-semibold mb-2">No policies for this insurer yet.</p>
          <button onClick={() => { setForm({ insurerName }); setModalOpen(true); }}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-accent-hover mt-4">
            <Plus size={16} /> Add Asset
          </button>
        </motion.div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-2 md:overflow-visible">
          {insurerAssets.map(a => (
            <motion.div key={a.id} variants={fadeUp} onClick={() => selectMode ? toggleSelect(a.id) : setDetailAsset(a)}
              className={`min-w-[240px] cursor-pointer rounded-xl border bg-card p-5 shadow-sm transition-all ${selectMode && selected.has(a.id) ? 'border-primary bg-accent-light' : 'border-border'}`}>
              {selectMode && <input type="checkbox" checked={selected.has(a.id)} onChange={() => toggleSelect(a.id)} className="mb-2 h-4 w-4 accent-primary" />}
              <h4 className="font-semibold">{a.policyType}</h4>
              {a.policyNumber && <p className="text-xs text-muted-foreground font-mono mt-1">••••{a.policyNumber.slice(-4)}</p>}
              <div className="mt-2 flex items-center gap-2">
                {a.nomineeName ? <span className="h-2 w-2 rounded-full bg-accent" /> : <span className="h-2 w-2 rounded-full bg-warning" />}
                {a.notes && <FileText size={12} className="text-muted-foreground" />}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <MultiSelectBar count={selected.size} onDelete={() => setBulkDeleteOpen(true)} />

      <AssetModal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Insurance Policy" onSave={handleSave}>
        <FormField label="Policy Type" required>
          <select value={form.policyType || ''} onChange={e => setForm({ ...form, policyType: e.target.value })} className={selectClass}>
            <option value="">Select type</option>
            {policyTypes.map(t => <option key={t}>{t}</option>)}
          </select>
        </FormField>
        <FormField label="Policy Number" required>
          <input value={form.policyNumber || ''} onChange={e => setForm({ ...form, policyNumber: e.target.value })} className={inputClass} />
        </FormField>
        <FormField label="Sum Assured">
          <input value={form.sumAssured || ''} onChange={e => setForm({ ...form, sumAssured: e.target.value })} className={inputClass} />
        </FormField>
        <FormField label="Next Due Date">
          <input type="date" value={form.nextDueDate || ''} onChange={e => setForm({ ...form, nextDueDate: e.target.value })} className={inputClass} />
        </FormField>
        <FormField label="Nominee Name">
          <input value={form.nomineeName || ''} onChange={e => setForm({ ...form, nomineeName: e.target.value })} className={inputClass} />
        </FormField>
        <FormField label="Notes">
          <textarea value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} className={inputClass} rows={3} />
        </FormField>
      </AssetModal>

      <AssetDetailPopup open={!!detailAsset} onClose={() => setDetailAsset(null)}
        title={detailAsset?.policyType || ''} subtitle={detailAsset?.insurerName}
        initialValues={detailAsset || {}} onSave={vals => { if (detailAsset) { updateAsset('insurance', detailAsset.id, vals); addToast('Asset updated'); } }}>
        {(vals, set) => (
          <>
            <FormField label="Policy Type">
              <select value={vals.policyType || ''} onChange={e => set('policyType', e.target.value)} className={selectClass}>
                {policyTypes.map(t => <option key={t}>{t}</option>)}
              </select>
            </FormField>
            <FormField label="Policy Number">
              <input value={vals.policyNumber || ''} onChange={e => set('policyNumber', e.target.value)} className={inputClass} />
            </FormField>
            <FormField label="Sum Assured">
              <input value={vals.sumAssured || ''} onChange={e => set('sumAssured', e.target.value)} className={inputClass} />
            </FormField>
            <FormField label="Premium Amount">
              <input type="number" value={vals.premiumAmount || ''} onChange={e => set('premiumAmount', Number(e.target.value))} className={inputClass} />
            </FormField>
            <FormField label="Nominee Name">
              <input value={vals.nomineeName || ''} onChange={e => set('nomineeName', e.target.value)} className={inputClass} />
            </FormField>
            <FormField label="Add Note">
              <textarea value={vals.notes || ''} onChange={e => set('notes', e.target.value)} className={inputClass} rows={3} />
            </FormField>
          </>
        )}
      </AssetDetailPopup>

      <ConfirmModal open={bulkDeleteOpen} onClose={() => setBulkDeleteOpen(false)} onConfirm={handleBulkDelete}
        title={`Delete ${selected.size} asset(s)?`} description="This cannot be undone." confirmLabel="Delete" confirmVariant="danger" />
    </motion.div>
  );
};

export default InsuranceDetailPage;
