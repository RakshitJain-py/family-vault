import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, MoreVertical, Trash2, Edit, FileText, ChevronDown } from 'lucide-react';
import { useAppContext, StockAsset } from '@/context/AppContext';
import AssetModal, { FormField, inputClass, selectClass } from '@/components/AssetModal';
import AssetDetailPopup from '@/components/AssetDetailPopup';
import MultiSelectBar from '@/components/MultiSelectBar';
import SmartSearchDropdown from '@/components/SmartSearchDropdown';
import ConfirmModal from '@/components/ConfirmModal';

const fadeUp = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };
const accountTypes = ['Equity Stocks', 'Mutual Funds', 'IPO Investments', 'ETF', 'Bonds', 'Government Securities', 'REITs', 'InvITs', 'ESOPs', 'Other'];
const brokerOptions = ['Zerodha', 'Groww', 'Upstox', 'Angel One', 'ICICI Direct', 'HDFC Securities', 'Kotak Securities', 'Paytm Money', '5paisa'];
const relations = ['Spouse', 'Child', 'Parent', 'Sibling', 'Other'];
const valueRanges = ['Under ₹1L', '₹1L–₹10L', '₹10L–₹50L', 'Above ₹50L', 'Prefer not to say'];

const StocksPage = () => {
  const navigate = useNavigate();
  const { assets, addAsset, updateAsset, deleteAsset, addToast } = useAppContext();
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<StockAsset>>({});
  const [showMore, setShowMore] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [detailAsset, setDetailAsset] = useState<StockAsset | null>(null);
  const [customBroker, setCustomBroker] = useState(false);

  const toggleSelect = (id: string) => { const n = new Set(selected); n.has(id) ? n.delete(id) : n.add(id); setSelected(n); };

  const openAdd = (prefill?: string) => {
    setForm(prefill ? { brokerName: prefill } : {});
    setEditId(null); setShowMore(false); setCustomBroker(false); setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.brokerName || !form.accountType || !form.dematId) { addToast('Please fill required fields', 'warning'); return; }
    if (editId) { updateAsset('stocks', editId, form); addToast('Asset updated'); }
    else { addAsset('stocks', form); addToast('Asset added to Stocks'); }
    setModalOpen(false);
  };

  const handleDelete = () => { if (deleteId) { deleteAsset('stocks', deleteId); addToast('Asset deleted', 'warning'); setDeleteId(null); } };
  const handleBulkDelete = () => {
    selected.forEach(id => deleteAsset('stocks', id));
    addToast(`${selected.size} assets deleted`, 'warning');
    setSelected(new Set()); setSelectMode(false); setBulkDeleteOpen(false);
  };

  const brokerNames = assets.stocks.map(a => a.brokerName);

  return (
    <motion.div initial="initial" animate="animate" className="mx-auto max-w-4xl px-4 pt-20 pb-16">
      <motion.div variants={fadeUp} className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="rounded-lg border border-border p-2 hover:bg-secondary"><ArrowLeft size={18} /></button>
          <h1 className="font-display text-2xl font-semibold">Stocks & Investments</h1>
          <span className="rounded-full bg-accent-light px-2.5 py-0.5 text-xs font-medium text-primary">{assets.stocks.length} assets</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { setSelectMode(!selectMode); setSelected(new Set()); }}
            className="rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-secondary">{selectMode ? 'Cancel' : 'Select'}</button>
          <button onClick={() => openAdd()} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-accent-hover">
            <Plus size={16} /> Add Asset
          </button>
        </div>
      </motion.div>

      <motion.div variants={fadeUp}>
        <SmartSearchDropdown items={brokerNames} placeholder="Search your brokers..." basePath="/assets/stocks"
          onAddNew={name => openAdd(name)} emptyLabel="No investments added yet" />
      </motion.div>

      {assets.stocks.length === 0 ? (
        <motion.div variants={fadeUp} className="flex flex-col items-center py-20 text-center">
          <span className="text-5xl mb-4">📈</span>
          <p className="font-display text-xl font-semibold mb-2">No assets added yet</p>
          <p className="text-sm text-muted-foreground mb-6">Add your first investment to get started.</p>
          <button onClick={() => openAdd()} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-accent-hover">
            <Plus size={16} /> Add Asset
          </button>
        </motion.div>
      ) : (
        <div className="grid gap-4">
          {assets.stocks.map(a => (
            <motion.div key={a.id} variants={fadeUp} onClick={() => selectMode ? toggleSelect(a.id) : setDetailAsset(a)}
              className={`relative cursor-pointer rounded-xl border bg-card p-5 shadow-sm transition-all ${selectMode && selected.has(a.id) ? 'border-primary bg-accent-light' : 'border-border'}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {selectMode && <input type="checkbox" checked={selected.has(a.id)} onChange={() => toggleSelect(a.id)} className="mt-1 h-4 w-4 accent-primary" />}
                  <div>
                    <h3 className="font-semibold">{a.brokerName}</h3>
                    <span className="mt-1 inline-block rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium">{a.accountType}</span>
                    {a.dematId && <p className="mt-1 text-xs text-muted-foreground font-mono">••••{a.dematId.slice(-4)}</p>}
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
                {a.nomineeName ? <span className="flex items-center gap-1 text-xs text-muted-foreground"><span className="h-2 w-2 rounded-full bg-accent" /> Nominee Added</span>
                  : <span className="flex items-center gap-1 text-xs text-muted-foreground"><span className="h-2 w-2 rounded-full bg-warning" /> No Nominee</span>}
                {a.notes && <FileText size={12} className="text-muted-foreground" />}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <MultiSelectBar count={selected.size} onDelete={() => setBulkDeleteOpen(true)} />

      <AssetModal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Asset' : 'Add Stock/Investment'} onSave={handleSave}>
        <FormField label="Broker / Institution Name" required>
          {customBroker ? (
            <input value={form.brokerName || ''} onChange={e => setForm({ ...form, brokerName: e.target.value })} className={inputClass} placeholder="Type broker name" />
          ) : (
            <select value={form.brokerName || ''} onChange={e => {
              if (e.target.value === '__other') { setCustomBroker(true); setForm({ ...form, brokerName: '' }); }
              else setForm({ ...form, brokerName: e.target.value });
            }} className={selectClass}>
              <option value="">Select broker</option>
              {brokerOptions.map(b => <option key={b}>{b}</option>)}
              <option value="__other">Other (type below)</option>
            </select>
          )}
        </FormField>
        <FormField label="Asset Type" required>
          <select value={form.accountType || ''} onChange={e => setForm({ ...form, accountType: e.target.value })} className={selectClass}>
            <option value="">Select type</option>
            {accountTypes.map(t => <option key={t}>{t}</option>)}
          </select>
        </FormField>
        <FormField label="BO ID / Demat ID" required>
          <input value={form.dematId || ''} onChange={e => setForm({ ...form, dematId: e.target.value })} className={inputClass} placeholder="Enter Demat or BO ID" />
        </FormField>
        <button onClick={() => setShowMore(!showMore)} className="flex items-center gap-1 text-sm font-medium text-primary">
          More Details <ChevronDown size={14} className={`transition-transform ${showMore ? 'rotate-180' : ''}`} />
        </button>
        {showMore && (
          <>
            <FormField label="Depository Participant (DP)">
              <input value={form.depository || ''} onChange={e => setForm({ ...form, depository: e.target.value })} className={inputClass} placeholder="NSDL / CDSL / other" />
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
            <FormField label="Approx. Value Range">
              <select value={form.valueRange || ''} onChange={e => setForm({ ...form, valueRange: e.target.value })} className={selectClass}>
                <option value="">Select</option>
                {valueRanges.map(v => <option key={v}>{v}</option>)}
              </select>
            </FormField>
            <FormField label="Notes">
              <textarea value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} className={inputClass} rows={3} />
            </FormField>
          </>
        )}
      </AssetModal>

      <AssetDetailPopup open={!!detailAsset} onClose={() => setDetailAsset(null)}
        title={detailAsset?.accountType || ''} subtitle={detailAsset?.brokerName}
        initialValues={detailAsset || {}} onSave={vals => { if (detailAsset) { updateAsset('stocks', detailAsset.id, vals); addToast('Asset updated'); } }}>
        {(vals, set) => (
          <>
            <FormField label="Asset Type">
              <select value={vals.accountType || ''} onChange={e => set('accountType', e.target.value)} className={selectClass}>
                {accountTypes.map(t => <option key={t}>{t}</option>)}
              </select>
            </FormField>
            <FormField label="BO ID / Demat ID">
              <input value={vals.dematId || ''} onChange={e => set('dematId', e.target.value)} className={inputClass} />
            </FormField>
            <FormField label="DP Name">
              <input value={vals.depository || ''} onChange={e => set('depository', e.target.value)} className={inputClass} />
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

      <ConfirmModal open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Delete Asset" description="Delete this asset? This cannot be undone." confirmLabel="Delete" confirmVariant="danger" />
      <ConfirmModal open={bulkDeleteOpen} onClose={() => setBulkDeleteOpen(false)} onConfirm={handleBulkDelete}
        title={`Delete ${selected.size} asset(s)?`} description="This cannot be undone." confirmLabel="Delete" confirmVariant="danger" />
    </motion.div>
  );
};

export default StocksPage;
