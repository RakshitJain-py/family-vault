import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Search, MoreVertical, Trash2, Edit, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppContext, InsuranceAsset } from '@/context/AppContext';
import AssetModal, { FormField, inputClass, selectClass } from '@/components/AssetModal';
import ConfirmModal from '@/components/ConfirmModal';

const fadeUp = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };
const policyTypes = ['Term Life', 'Health', 'Motor', 'ULIP', 'Endowment', 'Critical Illness', 'Other'];
const frequencies = ['Monthly', 'Quarterly', 'Half-Yearly', 'Yearly'];
const relations = ['Spouse', 'Child', 'Parent', 'Sibling', 'Other'];

const InsurancePage = () => {
  const navigate = useNavigate();
  const { assets, addAsset, updateAsset, deleteAsset, addToast } = useAppContext();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<InsuranceAsset>>({});
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [paymentStatus, setPaymentStatus] = useState<Record<string, 'paid' | 'upcoming' | 'missed'>>({});

  const filtered = assets.insurance.filter(a =>
    [a.insurerName, a.policyType, a.notes].join(' ').toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setForm({}); setEditId(null); setModalOpen(true); };
  const openEdit = (a: InsuranceAsset) => { setForm(a); setEditId(a.id); setModalOpen(true); setMenuOpen(null); };
  const handleSave = () => {
    if (!form.insurerName || !form.policyType) { addToast('Please fill required fields', 'warning'); return; }
    if (editId) { updateAsset('insurance', editId, form); addToast('Asset updated'); }
    else { addAsset('insurance', form); addToast('Asset added'); }
    setModalOpen(false);
  };
  const handleDelete = () => {
    if (deleteId) { deleteAsset('insurance', deleteId); addToast('Asset deleted', 'warning'); setDeleteId(null); }
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

  const statusColors = { paid: 'bg-accent', upcoming: 'bg-warning', missed: 'bg-danger' };

  return (
    <motion.div initial="initial" animate="animate" className="mx-auto max-w-4xl px-4 pt-20 pb-16">
      <motion.div variants={fadeUp} className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="rounded-lg border border-border p-2 hover:bg-secondary"><ArrowLeft size={18} /></button>
          <h1 className="font-display text-2xl font-semibold">Insurance</h1>
          <span className="rounded-full bg-accent-light px-2.5 py-0.5 text-xs font-medium text-accent">{assets.insurance.length} assets</span>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-accent-hover transition-colors">
          <Plus size={16} /> Add Asset
        </button>
      </motion.div>

      <motion.div variants={fadeUp}>
        <div className="relative mb-6">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search policies..."
            className="w-full rounded-lg border border-border bg-surface2 py-2.5 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-accent-light" />
        </div>
      </motion.div>

      {filtered.length === 0 ? (
        <motion.div variants={fadeUp} className="flex flex-col items-center py-20 text-center">
          <span className="text-5xl mb-4">🛡️</span>
          <p className="font-display text-xl font-semibold mb-2">No policies added yet</p>
          <p className="text-sm text-muted-foreground mb-6">Add your first insurance policy to get started.</p>
          <button onClick={openAdd} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-accent-hover">
            <Plus size={16} /> Add Asset
          </button>
        </motion.div>
      ) : (
        <div className="grid gap-4 mb-12">
          {filtered.map(a => (
            <motion.div key={a.id} variants={fadeUp} className="relative rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">{a.insurerName}</h3>
                  <span className="mt-1 inline-block rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium">{a.policyType}</span>
                </div>
                <div className="relative">
                  <button onClick={() => setMenuOpen(menuOpen === a.id ? null : a.id)} className="rounded-lg p-1 hover:bg-secondary"><MoreVertical size={18} /></button>
                  {menuOpen === a.id && (
                    <div className="absolute right-0 top-8 z-10 rounded-lg border border-border bg-card py-1 shadow-md min-w-[120px]">
                      <button onClick={() => openEdit(a)} className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-secondary"><Edit size={14} /> Edit</button>
                      <button onClick={() => { setDeleteId(a.id); setMenuOpen(null); }} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-danger-bg"><Trash2 size={14} /> Delete</button>
                    </div>
                  )}
                </div>
              </div>
              {a.sumAssured && <p className="mt-2 text-xs text-muted-foreground">Cover: {a.sumAssured}</p>}
              {a.nomineeName ? (
                <div className="mt-2 flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-accent" /><span className="text-xs text-muted-foreground">Nominee: {a.nomineeName}</span></div>
              ) : (
                <div className="mt-2 flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-warning" /><span className="text-xs text-muted-foreground">No Nominee</span></div>
              )}
            </motion.div>
          ))}
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
                <div key={day} className="relative py-2">
                  <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs ${policies ? 'font-semibold' : ''}`}>
                    {day}
                  </span>
                  {policies && (
                    <div className="flex justify-center gap-0.5 mt-0.5">
                      {policies.map(p => (
                        <button key={p.id} onClick={() => cycleStatus(p.id)}
                          className={`h-1.5 w-1.5 rounded-full ${statusColors[getStatus(p.id)]}`}
                          title={`${p.insurerName} — Click to change status`} />
                      ))}
                    </div>
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

      <AssetModal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Policy' : 'Add Insurance Policy'} onSave={handleSave}>
        <FormField label="Insurer Name" required>
          <input value={form.insurerName || ''} onChange={e => setForm({ ...form, insurerName: e.target.value })} className={inputClass} placeholder="e.g., LIC" />
        </FormField>
        <FormField label="Policy Type" required>
          <select value={form.policyType || ''} onChange={e => setForm({ ...form, policyType: e.target.value })} className={selectClass}>
            <option value="">Select type</option>
            {policyTypes.map(t => <option key={t}>{t}</option>)}
          </select>
        </FormField>
        <FormField label="Policy Number">
          <input value={form.policyNumber || ''} onChange={e => setForm({ ...form, policyNumber: e.target.value })} className={inputClass} />
        </FormField>
        <FormField label="Sum Assured / Cover">
          <input value={form.sumAssured || ''} onChange={e => setForm({ ...form, sumAssured: e.target.value })} className={inputClass} placeholder="e.g., ₹50 Lakhs" />
        </FormField>
        <FormField label="Premium Amount">
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
      </AssetModal>

      <ConfirmModal open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Delete Policy" description="Delete this policy? This cannot be undone." confirmLabel="Delete" confirmVariant="danger" />
    </motion.div>
  );
};

export default InsurancePage;
