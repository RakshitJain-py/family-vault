import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Search, MoreVertical, Trash2, Edit } from 'lucide-react';
import { useAppContext, BankAsset } from '@/context/AppContext';
import AssetModal, { FormField, inputClass, selectClass } from '@/components/AssetModal';
import ConfirmModal from '@/components/ConfirmModal';

const fadeUp = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };
const assetTypes = ['Savings Account', 'Current Account', 'Fixed Deposit', 'Recurring Deposit', 'Locker'];
const relations = ['Spouse', 'Child', 'Parent', 'Sibling', 'Other'];

const BanksPage = () => {
  const navigate = useNavigate();
  const { assets, addAsset, updateAsset, deleteAsset, addToast } = useAppContext();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<BankAsset>>({});

  const filtered = assets.banks.filter(a =>
    [a.institutionName, a.assetType, a.notes].join(' ').toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setForm({}); setEditId(null); setModalOpen(true); };
  const openEdit = (a: BankAsset) => { setForm(a); setEditId(a.id); setModalOpen(true); setMenuOpen(null); };
  const handleSave = () => {
    if (!form.institutionName || !form.assetType) { addToast('Please fill required fields', 'warning'); return; }
    if (editId) { updateAsset('banks', editId, form); addToast('Asset updated'); }
    else { addAsset('banks', form); addToast('Asset added'); }
    setModalOpen(false);
  };
  const handleDelete = () => {
    if (deleteId) { deleteAsset('banks', deleteId); addToast('Asset deleted', 'warning'); setDeleteId(null); }
  };

  return (
    <motion.div initial="initial" animate="animate" className="mx-auto max-w-4xl px-4 pt-20 pb-16">
      <motion.div variants={fadeUp} className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="rounded-lg border border-border p-2 hover:bg-secondary"><ArrowLeft size={18} /></button>
          <h1 className="font-display text-2xl font-semibold">Banks</h1>
          <span className="rounded-full bg-accent-light px-2.5 py-0.5 text-xs font-medium text-accent">{assets.banks.length} assets</span>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-accent-hover transition-colors">
          <Plus size={16} /> Add Asset
        </button>
      </motion.div>

      <motion.div variants={fadeUp}>
        <div className="relative mb-6">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search bank assets..."
            className="w-full rounded-lg border border-border bg-surface2 py-2.5 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-accent-light" />
        </div>
      </motion.div>

      {filtered.length === 0 ? (
        <motion.div variants={fadeUp} className="flex flex-col items-center py-20 text-center">
          <span className="text-5xl mb-4">🏦</span>
          <p className="font-display text-xl font-semibold mb-2">No assets added yet</p>
          <p className="text-sm text-muted-foreground mb-6">Add your first asset to get started.</p>
          <button onClick={openAdd} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-accent-hover">
            <Plus size={16} /> Add Asset
          </button>
        </motion.div>
      ) : (
        <div className="grid gap-4">
          {filtered.map(a => (
            <motion.div key={a.id} variants={fadeUp} className="relative rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">{a.institutionName}</h3>
                  <span className="mt-1 inline-block rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium">{a.assetType}</span>
                </div>
                <div className="relative">
                  <button onClick={() => setMenuOpen(menuOpen === a.id ? null : a.id)} className="rounded-lg p-1 hover:bg-secondary">
                    <MoreVertical size={18} />
                  </button>
                  {menuOpen === a.id && (
                    <div className="absolute right-0 top-8 z-10 rounded-lg border border-border bg-card py-1 shadow-md min-w-[120px]">
                      <button onClick={() => openEdit(a)} className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-secondary"><Edit size={14} /> Edit</button>
                      <button onClick={() => { setDeleteId(a.id); setMenuOpen(null); }} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-danger-bg"><Trash2 size={14} /> Delete</button>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                {a.nomineeName ? (
                  <><span className="h-2 w-2 rounded-full bg-accent" /><span className="text-xs text-muted-foreground">Nominee: {a.nomineeName}</span></>
                ) : (
                  <><span className="h-2 w-2 rounded-full bg-warning" /><span className="text-xs text-muted-foreground">No Nominee</span></>
                )}
              </div>
              {a.notes && <p className="mt-2 text-xs text-muted-foreground">{a.notes}</p>}
            </motion.div>
          ))}
        </div>
      )}

      <AssetModal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Asset' : 'Add Bank Asset'} onSave={handleSave}>
        <FormField label="Institution Name" required>
          <input value={form.institutionName || ''} onChange={e => setForm({ ...form, institutionName: e.target.value })} className={inputClass} placeholder="e.g., HDFC Bank" />
        </FormField>
        <FormField label="Asset Type" required>
          <select value={form.assetType || ''} onChange={e => setForm({ ...form, assetType: e.target.value })} className={selectClass}>
            <option value="">Select type</option>
            {assetTypes.map(t => <option key={t}>{t}</option>)}
          </select>
        </FormField>
        <FormField label="Account Number (last 4 digits)">
          <input value={form.accountNumber || ''} onChange={e => setForm({ ...form, accountNumber: e.target.value.slice(0, 4) })} className={inputClass} placeholder="1234" maxLength={4} />
        </FormField>
        <FormField label="Branch">
          <input value={form.branch || ''} onChange={e => setForm({ ...form, branch: e.target.value })} className={inputClass} />
        </FormField>
        <FormField label="Nominee Name">
          <input value={form.nomineeName || ''} onChange={e => setForm({ ...form, nomineeName: e.target.value })} className={inputClass} />
        </FormField>
        <FormField label="Nominee Relation">
          <select value={form.nomineeRelation || ''} onChange={e => setForm({ ...form, nomineeRelation: e.target.value })} className={selectClass}>
            <option value="">Select relation</option>
            {relations.map(r => <option key={r}>{r}</option>)}
          </select>
        </FormField>
        <FormField label="Notes">
          <textarea value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} className={inputClass} rows={3} />
        </FormField>
      </AssetModal>

      <ConfirmModal open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Delete Asset" description="Delete this asset? This cannot be undone." confirmLabel="Delete" confirmVariant="danger" />
    </motion.div>
  );
};

export default BanksPage;
