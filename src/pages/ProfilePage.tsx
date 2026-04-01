import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import { User, Building2, TrendingUp, Shield, FileText, ToggleRight, Edit, Trash2 } from 'lucide-react';
import ConfirmModal from '@/components/ConfirmModal';

const fadeUp = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, updateUser, assets, trustedContacts, recoveryEnabled, willData, addToast, deleteContact } = useAppContext();
  const [editField, setEditField] = useState<string | null>(null);
  const [fieldVal, setFieldVal] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [deleteContactId, setDeleteContactId] = useState<string | null>(null);

  const saveField = (field: string) => {
    updateUser({ [field]: fieldVal });
    addToast('Profile updated');
    setEditField(null);
  };

  const startEdit = (field: string, value: string) => { setEditField(field); setFieldVal(value); };

  const initials = user.displayName.slice(0, 2).toUpperCase();
  const willStatus = willData.finalized ? 'Completed' : willData.profile.fullName ? 'In Progress' : 'Not Started';

  const stats = [
    { label: 'Banks', count: `${assets.banks.length} assets`, icon: Building2, route: '/assets/banks' },
    { label: 'Stocks', count: `${assets.stocks.length} assets`, icon: TrendingUp, route: '/assets/stocks' },
    { label: 'Insurance', count: `${assets.insurance.length} assets`, icon: Shield, route: '/assets/insurance' },
    { label: 'Will Wizard', count: willStatus, icon: FileText, route: '/will-wizard' },
    { label: 'Recovery Switch', count: recoveryEnabled ? 'Active' : 'Inactive', icon: ToggleRight, route: '/recovery' },
  ];

  const maskPhone = (p: string) => p.length >= 10 ? `${p.slice(0, 2)}${'X'.repeat(5)}${p.slice(-3)}` : p;

  return (
    <motion.div initial="initial" animate="animate" className="mx-auto max-w-3xl px-4 pt-20 pb-16">
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center gap-4 mb-8">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-primary-foreground font-display text-xl font-semibold">{initials}</div>
        <div>
          <h1 className="font-display text-2xl font-semibold">{user.displayName}</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <p className="text-xs text-muted-foreground mt-1">Member since April 2025</p>
        </div>
      </motion.div>

      {/* Account Settings */}
      <motion.div variants={fadeUp} className="mb-8">
        <h2 className="font-display text-xl font-semibold mb-4">Account Settings</h2>
        <div className="rounded-xl border border-border bg-card divide-y divide-border shadow-sm">
          {[
            { key: 'displayName', label: 'Display Name', value: user.displayName },
            { key: 'email', label: 'Email Address', value: user.email },
            { key: 'phone', label: 'Phone Number', value: user.phone || 'Not set' },
          ].map(f => (
            <div key={f.key} className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="text-xs text-muted-foreground">{f.label}</p>
                {editField === f.key ? (
                  <input autoFocus value={fieldVal} onChange={e => setFieldVal(e.target.value)}
                    className="mt-1 rounded border border-border bg-surface2 px-2 py-1 text-sm outline-none" />
                ) : (
                  <p className="text-sm font-medium mt-0.5">{f.value}</p>
                )}
              </div>
              {editField === f.key ? (
                <button onClick={() => saveField(f.key)} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">Save</button>
              ) : (
                <button onClick={() => startEdit(f.key, f.key === 'phone' && !user.phone ? '' : (user as any)[f.key] || '')}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-secondary">Edit</button>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Danger Zone */}
      <motion.div variants={fadeUp} className="mb-8">
        <div className="rounded-xl border border-danger bg-card p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-danger mb-3">Danger Zone</h3>
          <div className="flex gap-3">
            <button onClick={() => addToast('You have been logged out.', 'success')}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-secondary">Log Out</button>
            <button onClick={() => setDeleteConfirm(true)}
              className="rounded-lg border border-danger px-4 py-2 text-sm font-medium text-danger hover:bg-danger-bg">Delete Account</button>
          </div>
        </div>
      </motion.div>

      {/* Trusted Members */}
      <motion.div variants={fadeUp} className="mb-8">
        <h2 className="font-display text-xl font-semibold mb-2">Trusted Members</h2>
        <p className="text-sm text-muted-foreground mb-4">People who may be contacted through your Recovery Switch.</p>
        {trustedContacts.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <p className="text-sm text-muted-foreground">No trusted contacts added yet. <Link to="/recovery" className="text-accent underline">Set them up in Recovery Switch.</Link></p>
          </div>
        ) : (
          <div className="space-y-3">
            {trustedContacts.map(c => (
              <div key={c.id} className="rounded-xl border border-border bg-card p-4 shadow-sm flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.relationship} • {maskPhone(c.phone)}</p>
                  {c.description && <p className="text-xs text-muted-foreground mt-1">{c.description}</p>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => navigate('/recovery')} className="p-1 hover:bg-secondary rounded"><Edit size={14} /></button>
                  <button onClick={() => setDeleteContactId(c.id)} className="p-1 hover:bg-danger-bg rounded text-danger"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
            <button onClick={() => navigate('/recovery')} className="text-sm text-accent hover:underline">+ Add more contacts</button>
          </div>
        )}
      </motion.div>

      {/* Assets Summary */}
      <motion.div variants={fadeUp}>
        <h2 className="font-display text-xl font-semibold mb-4">My Assets Summary</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {stats.map(s => (
            <button key={s.label} onClick={() => navigate(s.route)}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm hover:bg-secondary transition-colors text-left">
              <s.icon size={20} className="text-accent" />
              <div>
                <p className="text-sm font-medium">{s.label}</p>
                <p className="text-xs text-muted-foreground">{s.count}</p>
              </div>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Delete Account Modal */}
      <ConfirmModal open={deleteConfirm} onClose={() => { setDeleteConfirm(false); setDeleteInput(''); }}
        onConfirm={() => { if (deleteInput === 'DELETE') { addToast('Account deletion requested. Our team will contact you.', 'warning'); setDeleteConfirm(false); setDeleteInput(''); } }}
        title="Delete Account" description="This action is irreversible. Type DELETE to confirm."
        confirmLabel="Delete Account" confirmVariant="danger">
        <input value={deleteInput} onChange={e => setDeleteInput(e.target.value)}
          placeholder='Type "DELETE" to confirm' className="w-full rounded-lg border border-border bg-surface2 px-3 py-2 text-sm outline-none" />
      </ConfirmModal>

      <ConfirmModal open={!!deleteContactId} onClose={() => setDeleteContactId(null)}
        onConfirm={() => { if (deleteContactId) { deleteContact(deleteContactId); addToast('Contact removed', 'warning'); setDeleteContactId(null); } }}
        title="Remove Contact" description="Remove this person as a trusted contact?"
        confirmLabel="Remove" confirmVariant="danger" />
    </motion.div>
  );
};

export default ProfilePage;
