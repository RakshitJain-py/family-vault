import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, MoreVertical, Trash2, Edit, FileText, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppContext, InsuranceAsset } from '@/context/AppContext';
import AssetModal, { FormField, inputClass, selectClass } from '@/components/AssetModal';
import AssetDetailPopup from '@/components/AssetDetailPopup';
import MultiSelectBar from '@/components/MultiSelectBar';
import SmartSearchDropdown from '@/components/SmartSearchDropdown';
import ConfirmModal from '@/components/ConfirmModal';

const fadeUp = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };
const policyTypes = ['Term Life', 'Health', 'Motor', 'ULIP', 'Endowment', 'Critical Illness', 'Personal Accident', 'Other'];
const frequencies = ['Monthly', 'Quarterly', 'Half-Yearly', 'Yearly'];
const relations = ['Spouse', 'Child', 'Parent', 'Sibling', 'Other'];
const insurerOptions = ['LIC', 'HDFC Life', 'ICICI Prudential', 'SBI Life', 'Max Life', 'Bajaj Allianz', 'Tata AIA', 'Star Health', 'Niva Bupa', 'New India Assurance'];

const InsurancePage = () => {
  const navigate = useNavigate();
  const { assets, addAsset, updateAsset, deleteAsset, addToast } = useAppContext();
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<InsuranceAsset>>({});
  const [showMore, setShowMore] = useState(false);
  const [customInsurer, setCustomInsurer] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [detailAsset, setDetailAsset] = useState<InsuranceAsset | null>(null);

  // Calendar
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [paymentStatus, setPaymentStatus] = useState<Record<string, 'paid' | 'upcoming' | 'missed'>>({});

  const toggleSelect = (id: string) => { const n = new Set(selected); n.has(id) ? n.delete(id) : n.add(id); setSelected(n); };

  const openAdd = (prefill?: string) => {
    setForm(prefill ? { insurerName: prefill } : {});
    setEditId(null); setShowMore(false); setCustomInsurer(false); setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.insurerName || !form.policyType || !form.policyNumber) { addToast('Please fill required fields', 'warning'); return; }
    if (editId) { updateAsset('insurance', editId, form); addToast('Asset updated'); }
    else { addAsset('insurance', form); addToast('Asset added to Insurance'); }
    setModalOpen(false);
  };

  const handleDelete = () => { if (deleteId) { deleteAsset('insurance', deleteId); addToast('Asset deleted', 'warning'); setDeleteId(null); } };
  const handleBulkDelete = () => {
    selected.forEach(id => deleteAsset('insurance', id));
    addToast(`${selected.size} assets deleted`, 'warning');
    setSelected(new Set()); setSelectMode(false); setBulkDeleteOpen(false);
  };

  // Calendar logic
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const monthName = new Date(calYear, calMonth).toLocaleString('default', { month: 'long' });

  const dueDates = useMemo(() => {
    const map: Record<number, InsuranceAsset[]> = {};
    assets.insurance.forEach(a => {
      if (a.nextDueDate) {
        const d = new Date(a.nextDueDate);
        if (d.getMonth() === calMonth && d.getFullYear() === calYear) {
          const day = d.getDate();
          if (!map[day]) map[day] = [];
          map[day].push(a);
        }
      }
    });
    return map;
  }, [assets.insurance, calMonth, calYear]);

  const getStatusKey = (policyId: string) => `${policyId}-${calMonth}-${calYear}`;
  const getStatus = (policyId: string) => paymentStatus[getStatusKey(policyId)] || 'upcoming';
  const cycleStatus = (policyId: string) => {
    const key = getStatusKey(policyId);
    const current = paymentStatus[key] || 'upcoming';
    const next = current === 'upcoming' ? 'paid' : current === 'paid' ? 'missed' : 'upcoming';
    setPaymentStatus({ ...paymentStatus, [key]: next });
  };
  const statusColors: Record<string, string> = { paid: 'bg-accent', upcoming: 'bg-warning', missed: 'bg-danger' };

  const getDueStatus = (a: InsuranceAsset) => {
    const key = getStatusKey(a.id);
    if (paymentStatus[key] === 'paid') return { dot: 'bg-accent', label: 'Paid' };
    if (!a.nextDueDate) return { dot: 'bg-border', label: 'No date set' };
    const due = new Date(a.nextDueDate);
    const now = new Date();
    if (due < now) return { dot: 'bg-danger', label: 'Overdue' };
    const diff = due.getTime() - now.getTime();
    if (diff <= 30 * 86400000) return { dot: 'bg-warning', label: 'Upcoming' };
    return { dot: 'bg-warning', label: 'Upcoming' };
  };

  const insurerNames = assets.insurance.map(a => a.insurerName);

  return (
    <motion.div initial="initial" animate="animate" className="mx-auto max-w-4xl px-4 pt-20 pb-16">
      <motion.div variants={fadeUp} className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="rounded-lg border border-border p-2 hover:bg-secondary"><ArrowLeft size={18} /></button>
          <h1 className="font-display text-2xl font-semibold">Insurance</h1>
          <span className="rounded-full bg-accent-light px-2.5 py-0.5 text-xs font-medium text-primary">{assets.insurance.length} assets</span>
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
        <SmartSearchDropdown items={insurerNames} placeholder="Search your insurers..." basePath="/assets/insurance"
          onAddNew={name => openAdd(name)} emptyLabel="No policies added yet" />
      </motion.div>

      {assets.insurance.length === 0 ? (
        <motion.div variants={fadeUp} className="flex flex-col items-center py-20 text-center">
          <span className="text-5xl mb-4">🛡️</span>
          <p className="font-display text-xl font-semibold mb-2">No policies added yet</p>
          <p className="text-sm text-muted-foreground mb-6">Add your first insurance policy to get started.</p>
          <button onClick={() => openAdd()} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-accent-hover">
            <Plus size={16} /> Add Asset
          </button>
        </motion.div>
      ) : (
        <div className="grid gap-4 mb-12">
          {assets.insurance.map(a => {
            const due = getDueStatus(a);
            return (
              <motion.div key={a.id} variants={fadeUp} onClick={() => selectMode ? toggleSelect(a.id) : setDetailAsset(a)}
                className={`relative cursor-pointer rounded-xl border bg-card p-5 shadow-sm transition-all ${selectMode && selected.has(a.id) ? 'border-primary bg-accent-light' : 'border-border'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {selectMode && <input type="checkbox" checked={selected.has(a.id)} onChange={() => toggleSelect(a.id)} className="mt-1 h-4 w-4 accent-primary" />}
                    <div>
                      <h3 className="font-semibold">{a.insurerName}</h3>
                      <span className="mt-1 inline-block rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium">{a.policyType}</span>
                      {a.policyNumber && <p className="mt-1 text-xs text-muted-foreground font-mono">••••{a.policyNumber.slice(-4)}</p>}
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
                <div className="mt-3 flex items-center gap-3 flex-wrap">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground"><span className={`h-2 w-2 rounded-full ${due.dot}`} /> {due.label}</span>
                  {a.nomineeName ? <span className="flex items-center gap-1 text-xs text-muted-foreground"><span className="h-2 w-2 rounded-full bg-accent" /> Nominee Added</span>
                    : <span className="flex items-center gap-1 text-xs text-muted-foreground"><span className="h-2 w-2 rounded-full bg-warning" /> No Nominee</span>}
                  {a.notes && <FileText size={12} className="text-muted-foreground" />}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Payment Calendar */}
      {assets.insurance.length > 0 && (
        <motion.div variants={fadeUp} className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="font-display text-lg font-semibold mb-4">Payment Reminder Calendar</h3>
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); } else setCalMonth(m => m - 1); }}><ChevronLeft size={18} /></button>
            <span className="font-medium">{monthName} {calYear}</span>
            <button onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); } else setCalMonth(m => m + 1); }}><ChevronRight size={18} /></button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} className="py-1 font-medium text-muted-foreground">{d}</div>)}
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const policies = dueDates[day];
              return (
                <div key={day} className="relative py-2 group">
                  <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs ${policies ? 'font-semibold' : ''}`}>{day}</span>
                  {policies && (
                    <>
                      <div className="flex justify-center gap-0.5 mt-0.5">
                        {policies.map(p => (
                          <button key={p.id} onClick={() => cycleStatus(p.id)}
                            className={`h-1.5 w-1.5 rounded-full ${statusColors[getStatus(p.id)]}`}
                            title={`${p.insurerName} — Click to change status`} />
                        ))}
                      </div>
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block z-30 w-48 rounded-lg border border-border bg-card p-3 shadow-md text-left">
                        {policies.map(p => (
                          <div key={p.id} className="mb-2 last:mb-0">
                            <p className="text-xs font-semibold">{p.insurerName}</p>
                            {p.premiumAmount && <p className="text-xs text-muted-foreground">₹{p.premiumAmount} — {p.premiumFrequency}</p>}
                            <button onClick={() => cycleStatus(p.id)} className="text-xs text-primary mt-0.5">
                              Status: {getStatus(p.id)} (click to change)
                            </button>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex gap-4 mt-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-accent" /> Paid</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-warning" /> Upcoming</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-danger" /> Missed</span>
          </div>
        </motion.div>
      )}

      <MultiSelectBar count={selected.size} onDelete={() => setBulkDeleteOpen(true)} />

      {/* Add/Edit Modal */}
      <AssetModal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Policy' : 'Add Insurance Policy'} onSave={handleSave}>
        <FormField label="Insurer Name" required>
          {customInsurer ? (
            <input value={form.insurerName || ''} onChange={e => setForm({ ...form, insurerName: e.target.value })} className={inputClass} placeholder="Type insurer name" />
          ) : (
            <select value={form.insurerName || ''} onChange={e => {
              if (e.target.value === '__other') { setCustomInsurer(true); setForm({ ...form, insurerName: '' }); }
              else setForm({ ...form, insurerName: e.target.value });
            }} className={selectClass}>
              <option value="">Select insurer</option>
              {insurerOptions.map(n => <option key={n}>{n}</option>)}
              <option value="__other">Other (type below)</option>
            </select>
          )}
        </FormField>
        <FormField label="Policy Type" required>
          <select value={form.policyType || ''} onChange={e => setForm({ ...form, policyType: e.target.value })} className={selectClass}>
            <option value="">Select type</option>
            {policyTypes.map(t => <option key={t}>{t}</option>)}
          </select>
        </FormField>
        <FormField label="Policy Number" required>
          <input value={form.policyNumber || ''} onChange={e => setForm({ ...form, policyNumber: e.target.value })} className={inputClass} />
        </FormField>
        <button onClick={() => setShowMore(!showMore)} className="flex items-center gap-1 text-sm font-medium text-primary">
          More Details <ChevronDown size={14} className={`transition-transform ${showMore ? 'rotate-180' : ''}`} />
        </button>
        {showMore && (
          <>
            <FormField label="Sum Assured / Cover">
              <input value={form.sumAssured || ''} onChange={e => setForm({ ...form, sumAssured: e.target.value })} className={inputClass} placeholder="e.g., ₹50 Lakhs" />
            </FormField>
            <FormField label="Premium Amount (₹)">
              <input type="number" value={form.premiumAmount || ''} onChange={e => setForm({ ...form, premiumAmount: Number(e.target.value) })} className={inputClass} />
            </FormField>
            <FormField label="Premium Frequency">
              <select value={form.premiumFrequency || ''} onChange={e => setForm({ ...form, premiumFrequency: e.target.value })} className={selectClass}>
                <option value="">Select</option>
                {frequencies.map(f => <option key={f}>{f}</option>)}
              </select>
            </FormField>
            <FormField label="Next Due Date">
              <input type="date" value={form.nextDueDate || ''} onChange={e => setForm({ ...form, nextDueDate: e.target.value })} className={inputClass} />
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
              <textarea value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} className={inputClass} rows={3} />
            </FormField>
          </>
        )}
      </AssetModal>

      {/* Detail Popup */}
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
            <FormField label="Premium Frequency">
              <select value={vals.premiumFrequency || ''} onChange={e => set('premiumFrequency', e.target.value)} className={selectClass}>
                <option value="">Select</option>
                {frequencies.map(f => <option key={f}>{f}</option>)}
              </select>
            </FormField>
            <FormField label="Next Due Date">
              <input type="date" value={vals.nextDueDate || ''} onChange={e => set('nextDueDate', e.target.value)} className={inputClass} />
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
              <textarea value={vals.notes || ''} onChange={e => set('notes', e.target.value)} className={inputClass} rows={3} />
            </FormField>
          </>
        )}
      </AssetDetailPopup>

      <ConfirmModal open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Delete Policy" description="Delete this policy? This cannot be undone." confirmLabel="Delete" confirmVariant="danger" />
      <ConfirmModal open={bulkDeleteOpen} onClose={() => setBulkDeleteOpen(false)} onConfirm={handleBulkDelete}
        title={`Delete ${selected.size} asset(s)?`} description="This cannot be undone." confirmLabel="Delete" confirmVariant="danger" />
    </motion.div>
  );
};

export default InsurancePage;
