import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, MoreVertical, Trash2, Edit, FileText, User, ChevronDown } from 'lucide-react';
import { useAppContext, BankAsset } from '@/context/AppContext';
import AssetModal, { FormField, inputClass, selectClass } from '@/components/AssetModal';
import AssetDetailPopup from '@/components/AssetDetailPopup';
import MultiSelectBar from '@/components/MultiSelectBar';
import SmartSearchDropdown from '@/components/SmartSearchDropdown';
import ConfirmModal from '@/components/ConfirmModal';

const fadeUp = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };
const assetTypes = ['Savings Account', 'Current Account', 'Fixed Deposit', 'Recurring Deposit', 'Locker'];
const relations = ['Spouse', 'Child', 'Parent', 'Sibling', 'Other'];

const BanksPage = () => {
  const navigate = useNavigate();
  const { assets, addAsset, updateAsset, deleteAsset, addToast } = useAppContext();
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<BankAsset>>({});
  const [showMore, setShowMore] = useState(false);

  // Multi-select
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  // Detail popup
  const [detailAsset, setDetailAsset] = useState<BankAsset | null>(null);

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const openAdd = (prefill?: string) => {
    setForm(prefill ? { institutionName: prefill } : {});
    setEditId(null);
    setShowMore(false);
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.institutionName || !form.assetType || !form.accountNumber) {
      addToast('Please fill required fields', 'warning'); return;
    }
    if (editId) { updateAsset('banks', editId, form); addToast('Asset updated'); }
    else { addAsset('banks', form); addToast('Asset added to Banks'); }
    setModalOpen(false);
  };

  const handleDelete = () => {
    if (deleteId) { deleteAsset('banks', deleteId); addToast('Asset deleted', 'warning'); setDeleteId(null); }
  };

  const handleBulkDelete = () => {
    selected.forEach(id => deleteAsset('banks', id));
    addToast(`${selected.size} assets deleted`, 'warning');
    setSelected(new Set());
    setSelectMode(false);
    setBulkDeleteOpen(false);
  };

  const handleDetailSave = (vals: Record<string, any>) => {
    if (detailAsset) {
      updateAsset('banks', detailAsset.id, vals);
      addToast('Asset updated');
    }
  };

  const institutionNames = assets.banks.map(a => a.institutionName);

  return (
    <motion.div initial="initial" animate="animate" className="mx-auto max-w-4xl px-4 pt-20 pb-16">
      <motion.div variants={fadeUp} className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="rounded-lg border border-border p-2 hover:bg-secondary"><ArrowLeft size={18} /></button>
          <h1 className="font-display text-2xl font-semibold">Banks</h1>
          <span className="rounded-full bg-accent-light px-2.5 py-0.5 text-xs font-medium text-primary">{assets.banks.length} assets</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { setSelectMode(!selectMode); setSelected(new Set()); }}
            className="rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-secondary transition-colors">
            {selectMode ? 'Cancel' : 'Select'}
          </button>
          <button onClick={() => openAdd()} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-accent-hover transition-colors">
            <Plus size={16} /> Add Asset
          </button>
        </div>
      </motion.div>

      <motion.div variants={fadeUp}>
        <SmartSearchDropdown items={institutionNames} placeholder="Search your banks..." basePath="/assets/banks"
          onAddNew={(name) => openAdd(name)} emptyLabel="No banks added yet" />
      </motion.div>

      {assets.banks.length === 0 ? (
        <motion.div variants={fadeUp} className="flex flex-col items-center py-20 text-center">
          <span className="text-5xl mb-4">🏦</span>
          <p className="font-display text-xl font-semibold mb-2">No assets added yet</p>
          <p className="text-sm text-muted-foreground mb-6">Add your first asset to get started.</p>
          <button onClick={() => openAdd()} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-accent-hover">
            <Plus size={16} /> Add Asset
          </button>
        </motion.div>
      ) : (
        <div className="grid gap-4">
          {assets.banks.map(a => (
            <motion.div key={a.id} variants={fadeUp}
              onClick={() => selectMode ? toggleSelect(a.id) : setDetailAsset(a)}
              className={`relative cursor-pointer rounded-xl border bg-card p-5 shadow-sm transition-all ${selectMode && selected.has(a.id) ? 'border-primary bg-accent-light' : 'border-border'}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {selectMode && (
                    <input type="checkbox" checked={selected.has(a.id)} onChange={() => toggleSelect(a.id)}
                      className="mt-1 h-4 w-4 rounded border-border accent-primary" />
                  )}
                  <div>
                    <h3 className="font-semibold text-foreground">{a.institutionName}</h3>
                    <span className="mt-1 inline-block rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium">{a.assetType}</span>
                    {a.accountNumber && <p className="mt-1 text-xs text-muted-foreground font-mono">••••{a.accountNumber.slice(-4)}</p>}
                  </div>
                </div>
                {!selectMode && (
                  <div className="relative">
                    <button onClick={e => { e.stopPropagation(); setMenuOpen(menuOpen === a.id ? null : a.id); }} className="rounded-lg p-1 hover:bg-secondary">
                      <MoreVertical size={18} />
                    </button>
                    {menuOpen === a.id && (
                      <div className="absolute right-0 top-8 z-10 rounded-lg border border-border bg-card py-1 shadow-md min-w-[120px]">
                        <button onClick={e => { e.stopPropagation(); setForm(a); setEditId(a.id); setModalOpen(true); setMenuOpen(null); }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-secondary"><Edit size={14} /> Edit</button>
                        <button onClick={e => { e.stopPropagation(); setDeleteId(a.id); setMenuOpen(null); }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-danger-bg"><Trash2 size={14} /> Delete</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="mt-3 flex items-center gap-3">
                {a.nomineeName ? (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground"><span className="h-2 w-2 rounded-full bg-accent" /> Nominee Added</span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground"><span className="h-2 w-2 rounded-full bg-warning" /> No Nominee</span>
                )}
                {a.notes && <span className="flex items-center gap-1 text-xs text-muted-foreground"><FileText size={12} /></span>}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <MultiSelectBar count={selected.size} onDelete={() => setBulkDeleteOpen(true)} />

      {/* Add/Edit Modal */}
      <AssetModal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Asset' : 'Add Bank Asset'}
        onSave={handleSave} saveLabel={editId ? 'Save Changes' : 'Save Asset'}>
        <FormField label="Institution Name" required>
          <input value={form.institutionName || ''} onChange={e => setForm({ ...form, institutionName: e.target.value })} className={inputClass} placeholder="e.g., HDFC Bank, SBI" />
        </FormField>
        <FormField label="Asset Type" required>
          <select value={form.assetType || ''} onChange={e => setForm({ ...form, assetType: e.target.value })} className={selectClass}>
            <option value="">Select type</option>
            {assetTypes.map(t => <option key={t}>{t}</option>)}
          </select>
        </FormField>
        <FormField label="Account Number" required>
          <input value={form.accountNumber || ''} onChange={e => setForm({ ...form, accountNumber: e.target.value })} className={inputClass} placeholder="Stored securely, not shared" />
        </FormField>
        <button onClick={() => setShowMore(!showMore)} className="flex items-center gap-1 text-sm font-medium text-primary">
          More Details <ChevronDown size={14} className={`transition-transform ${showMore ? 'rotate-180' : ''}`} />
        </button>
        {showMore && (
          <>
            <FormField label="Branch Pincode">
              <input value={form.branch || ''} onChange={e => setForm({ ...form, branch: e.target.value.replace(/\D/g, '').slice(0, 6) })} className={inputClass} maxLength={6} placeholder="6-digit pincode" />
            </FormField>
            <FormField label="Nominee Name">
              <input value={form.nomineeName || ''} onChange={e => setForm({ ...form, nomineeName: e.target.value })} className={inputClass} />
            </FormField>
            <FormField label="Nominee Relation">
              <select value={form.nomineeRelation || ''} onChange={e => setForm({ ...form, nomineeRelation: e.target.value })} className={selectClass}>
                <option value="">Select</option>
                {relations.map(r => <option key={r}>{r}</option>)}
              </select>
            </FormField>
            <FormField label="Notes">
              <textarea value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} className={inputClass} rows={3} placeholder="Add any notes about this asset..." />
            </FormField>
          </>
        )}
      </AssetModal>

      {/* Detail Popup */}
      <AssetDetailPopup open={!!detailAsset} onClose={() => setDetailAsset(null)}
        title={detailAsset?.assetType || ''} subtitle={detailAsset?.institutionName}
        initialValues={detailAsset || {}} onSave={handleDetailSave}>
        {(vals, set) => (
          <>
            <FormField label="Asset Type">
              <select value={vals.assetType || ''} onChange={e => set('assetType', e.target.value)} className={selectClass}>
                {assetTypes.map(t => <option key={t}>{t}</option>)}
              </select>
            </FormField>
            <FormField label="Account Number (last 4)">
              <input value={vals.accountNumber || ''} onChange={e => set('accountNumber', e.target.value)} className={inputClass} />
            </FormField>
            <FormField label="Branch Pincode">
              <input value={vals.branch || ''} onChange={e => set('branch', e.target.value)} className={inputClass} />
            </FormField>
            <FormField label="Nominee Name">
              <input value={vals.nomineeName || ''} onChange={e => set('nomineeName', e.target.value)} className={inputClass} />
            </FormField>
            <FormField label="Nominee Relation">
              <select value={vals.nomineeRelation || ''} onChange={e => set('nomineeRelation', e.target.value)} className={selectClass}>
                <option value="">Select</option>
                {relations.map(r => <option key={r}>{r}</option>)}
              </select>
            </FormField>
            <FormField label="Add Note">
              <textarea value={vals.notes || ''} onChange={e => set('notes', e.target.value)} className={inputClass} rows={3} placeholder="Add any notes about this asset..." />
            </FormField>
          </>
        )}
      </AssetDetailPopup>

      <ConfirmModal open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Delete Asset" description="Delete this asset? This cannot be undone." confirmLabel="Delete" confirmVariant="danger" />

      <ConfirmModal open={bulkDeleteOpen} onClose={() => setBulkDeleteOpen(false)} onConfirm={handleBulkDelete}
        title={`Delete ${selected.size} asset(s)?`} description="Are you sure you want to delete the selected assets? This cannot be undone." confirmLabel="Delete" confirmVariant="danger" />
    </motion.div>
  );
};

export default BanksPage;
