import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import ConfirmModal from '@/components/ConfirmModal';
import AssetModal, { FormField, inputClass, selectClass } from '@/components/AssetModal';
import { ArrowUp, ArrowDown, Plus, Edit, Trash2 } from 'lucide-react';

const fadeUp = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };
const relations = ['Spouse', 'Child', 'Parent', 'Sibling', 'Friend', 'Lawyer', 'Other'];

const steps = [
  { num: 1, icon: '🟢', title: 'You enable the Recovery Switch', desc: 'A simple toggle in your account activates the mechanism. You remain in complete control.' },
  { num: 2, icon: '📱', title: '14-day inactivity check', desc: 'If Vault detects no activity for 14 days, a gentle wellness notification is sent to your registered contact.' },
  { num: 3, icon: '🔔', title: 'Reminder window: 7 days', desc: 'If there\'s no response to the wellness check, Vault sends follow-up reminders every 48 hours for 7 days.' },
  { num: 4, icon: '👤', title: 'Trusted person is contacted', desc: 'If still no response, Vault reaches out to your designated trusted contact(s) in order of priority.' },
  { num: 5, icon: '✅', title: 'Trusted person verifies', desc: 'Your trusted contact confirms the situation and verifies their identity.' },
  { num: 6, icon: '📋', title: 'Structured guidance provided', desc: 'Vault provides your trusted contact with an organized summary of your asset map and next-step guidance.' },
];

interface ContactForm { name: string; phone: string; email: string; relationship: string; description: string; }
const emptyContact: ContactForm = { name: '', phone: '', email: '', relationship: '', description: '' };

const RecoveryPage = () => {
  const navigate = useNavigate();
  const { recoveryEnabled, toggleRecovery, trustedContacts, addContact, updateContact, deleteContact, reorderContacts, addToast } = useAppContext();
  const [confirmToggle, setConfirmToggle] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<ContactForm>(emptyContact);

  const handleToggle = () => setConfirmToggle(true);
  const confirmToggleAction = () => {
    toggleRecovery(!recoveryEnabled);
    addToast(recoveryEnabled ? 'Recovery Switch disabled' : 'Recovery Switch enabled', 'success');
    setConfirmToggle(false);
  };

  const openAdd = () => { setForm(emptyContact); setEditId(null); setModalOpen(true); };
  const openEdit = (c: any) => { setForm({ name: c.name, phone: c.phone, email: c.email || '', relationship: c.relationship, description: c.description || '' }); setEditId(c.id); setModalOpen(true); };

  const handleSave = () => {
    if (!form.name || !form.phone || !form.relationship) { addToast('Please fill required fields', 'warning'); return; }
    if (!/^[6-9]\d{9}$/.test(form.phone)) { addToast('Enter a valid 10-digit Indian phone number', 'warning'); return; }
    if (editId) { updateContact(editId, form); addToast('Contact updated'); }
    else {
      if (trustedContacts.length >= 3) { addToast('Maximum 3 contacts allowed', 'warning'); return; }
      addContact(form);
      addToast('Contact added');
    }
    setModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (deleteId) { deleteContact(deleteId); addToast('Contact removed', 'warning'); setDeleteId(null); }
  };

  const moveContact = (index: number, dir: -1 | 1) => {
    const newContacts = [...trustedContacts];
    const swapIdx = index + dir;
    if (swapIdx < 0 || swapIdx >= newContacts.length) return;
    [newContacts[index], newContacts[swapIdx]] = [newContacts[swapIdx], newContacts[index]];
    reorderContacts(newContacts);
  };

  return (
    <motion.div initial="initial" animate="animate" className="mx-auto max-w-4xl px-4 pt-20 pb-16">
      <motion.div variants={fadeUp} className="mb-8">
        <h1 className="font-display text-3xl font-semibold mb-2">Recovery Switch</h1>
        <p className="text-muted-foreground">A calm, structured mechanism for your family — activated only when truly needed.</p>
      </motion.div>

      {/* Toggle */}
      <motion.div variants={fadeUp} className="mb-12 rounded-xl border border-border bg-card p-6 shadow-sm flex items-center justify-between">
        <div>
          <p className="font-semibold text-foreground">{recoveryEnabled ? 'Recovery Switch is Active' : 'Recovery Switch is Off'}</p>
          <p className="text-sm text-muted-foreground mt-1">{recoveryEnabled ? 'Your trusted contacts will be notified if you become unreachable.' : 'Enable to activate the recovery mechanism.'}</p>
        </div>
        <button onClick={handleToggle}
          className={`relative h-8 w-14 rounded-full transition-colors ${recoveryEnabled ? 'bg-accent' : 'bg-border'}`}>
          <span className={`absolute top-1 h-6 w-6 rounded-full bg-card shadow transition-transform ${recoveryEnabled ? 'left-7' : 'left-1'}`} />
        </button>
      </motion.div>

      {/* Steps */}
      <motion.div variants={fadeUp} className="mb-12">
        <h2 className="font-display text-xl font-semibold mb-6">How It Works</h2>
        <div className="space-y-4">
          {steps.map(s => (
            <div key={s.num} className="flex gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
              <span className="text-2xl">{s.icon}</span>
              <div>
                <p className="font-semibold text-foreground">{s.title}</p>
                <p className="text-sm text-muted-foreground mt-1">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Disclaimer */}
      <motion.div variants={fadeUp} className="mb-12 rounded-xl border border-border bg-secondary p-6">
        <p className="font-semibold text-foreground mb-3">🔒 What Vault never does:</p>
        <ul className="space-y-1 text-sm text-muted-foreground">
          <li>• Vault never transfers assets automatically</li>
          <li>• Vault never shares full account numbers or passwords</li>
          <li>• Vault never bypasses legal processes</li>
          <li>• Vault never contacts anyone without the 14 + 7 day verification window</li>
        </ul>
        <p className="text-sm text-muted-foreground mt-3">Vault only provides organizational guidance and an asset summary to your trusted contact.</p>
      </motion.div>

      {/* Trusted Contacts */}
      <motion.div variants={fadeUp} id="contacts">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-xl font-semibold">Your Trusted Contacts</h2>
            <p className="text-sm text-muted-foreground mt-1">{trustedContacts.length} of 3 contacts added</p>
          </div>
          {trustedContacts.length < 3 && (
            <button onClick={openAdd} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-accent-hover transition-colors">
              <Plus size={16} /> Add Contact
            </button>
          )}
        </div>

        {trustedContacts.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <p className="text-muted-foreground mb-4">No trusted contacts added yet.</p>
            <button onClick={openAdd} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-accent-hover">
              <Plus size={16} className="inline mr-1" /> Add Contact
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {trustedContacts.map((c, i) => (
              <div key={c.id} className="rounded-xl border border-border bg-card p-5 shadow-sm flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-accent-light px-2 py-0.5 text-xs font-medium text-accent">Priority {c.priority}</span>
                    <span className="font-semibold">{c.name}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{c.relationship} • {c.phone}</p>
                  {c.description && <p className="text-xs text-muted-foreground mt-1">{c.description}</p>}
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => moveContact(i, -1)} disabled={i === 0} className="p-1 hover:bg-secondary rounded disabled:opacity-30"><ArrowUp size={16} /></button>
                  <button onClick={() => moveContact(i, 1)} disabled={i === trustedContacts.length - 1} className="p-1 hover:bg-secondary rounded disabled:opacity-30"><ArrowDown size={16} /></button>
                  <button onClick={() => openEdit(c)} className="p-1 hover:bg-secondary rounded"><Edit size={16} /></button>
                  <button onClick={() => setDeleteId(c.id)} className="p-1 hover:bg-danger-bg rounded text-danger"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-4">These contacts are also visible on your <Link to="/profile" className="text-accent underline">Profile page</Link>.</p>
      </motion.div>

      <ConfirmModal open={confirmToggle} onClose={() => setConfirmToggle(false)} onConfirm={confirmToggleAction}
        title={recoveryEnabled ? 'Disable Recovery Switch?' : 'Enable Recovery Switch?'}
        description={recoveryEnabled ? 'Your trusted contacts will no longer be activated automatically.' : 'Enabling Recovery Switch means Vault will monitor your activity and reach out to your trusted contact if you become unreachable for an extended period. You can disable this at any time.'}
        confirmLabel={recoveryEnabled ? 'Disable' : 'Enable'} />

      <AssetModal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Contact' : 'Add Trusted Contact'} onSave={handleSave} saveLabel={editId ? 'Update' : 'Add Contact'}>
        <FormField label="Full Name" required>
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inputClass} />
        </FormField>
        <FormField label="Phone Number" required>
          <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} className={inputClass} placeholder="10-digit number" />
        </FormField>
        <FormField label="Email Address">
          <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className={inputClass} />
        </FormField>
        <FormField label="Relationship" required>
          <select value={form.relationship} onChange={e => setForm({ ...form, relationship: e.target.value })} className={selectClass}>
            <option value="">Select</option>
            {relations.map(r => <option key={r}>{r}</option>)}
          </select>
        </FormField>
        <FormField label="Short Description">
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value.slice(0, 100) })} className={inputClass} rows={2} maxLength={100} placeholder="e.g., My elder brother, lives in Delhi" />
        </FormField>
      </AssetModal>

      <ConfirmModal open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDeleteConfirm}
        title="Remove Contact" description={`Remove ${trustedContacts.find(c => c.id === deleteId)?.name} as a trusted contact?`}
        confirmLabel="Remove" confirmVariant="danger" />
    </motion.div>
  );
};

export default RecoveryPage;
