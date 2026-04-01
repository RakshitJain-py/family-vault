import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface BankAsset {
  id: string; institutionName: string; assetType: string; accountNumber?: string;
  branch?: string; nomineeName?: string; nomineeRelation?: string; notes?: string;
  reminderEnabled?: boolean; reminderDate?: string;
}
export interface StockAsset {
  id: string; brokerName: string; accountType: string; dematId?: string;
  depository?: string; nomineeName?: string; nomineeRelation?: string;
  valueRange?: string; notes?: string;
}
export interface InsuranceAsset {
  id: string; insurerName: string; policyType: string; policyNumber?: string;
  sumAssured?: string; premiumAmount?: number; premiumFrequency?: string;
  nextDueDate?: string; nomineeName?: string; nomineeRelation?: string;
  notes?: string; status?: string;
}
export interface TrustedContact {
  id: string; name: string; phone: string; email?: string;
  relationship: string; description?: string; priority: number;
}
export interface WillData {
  profile: { fullName?: string; dob?: string; aadhaarLast4?: string; city?: string; religion?: string };
  assets: { id: string; category: string; name: string; value?: string }[];
  beneficiaries: { id: string; fullName: string; relationship: string; allocation: number; notes?: string }[];
  executor: { fullName?: string; phone?: string; email?: string; relationship?: string;
    altEnabled?: boolean; altFullName?: string; altPhone?: string; altEmail?: string; altRelationship?: string };
  witnesses: { fullName?: string; age?: number; address?: string; relationship?: string }[];
  finalized: boolean;
  downloaded: boolean;
}
export interface AppState {
  user: { displayName: string; email: string; phone: string };
  assets: { banks: BankAsset[]; stocks: StockAsset[]; insurance: InsuranceAsset[] };
  recoveryEnabled: boolean;
  trustedContacts: TrustedContact[];
  willData: WillData;
  toasts: { id: string; message: string; type: 'success' | 'warning' | 'error' }[];
}

const defaultState: AppState = {
  user: { displayName: 'User2347', email: 'user2347@vault.in', phone: '' },
  assets: { banks: [], stocks: [], insurance: [] },
  recoveryEnabled: false,
  trustedContacts: [],
  willData: {
    profile: {}, assets: [], beneficiaries: [], executor: {}, witnesses: [{}, {}],
    finalized: false, downloaded: false,
  },
  toasts: [],
};

interface AppContextType extends AppState {
  addAsset: (category: 'banks' | 'stocks' | 'insurance', asset: any) => void;
  updateAsset: (category: 'banks' | 'stocks' | 'insurance', id: string, asset: any) => void;
  deleteAsset: (category: 'banks' | 'stocks' | 'insurance', id: string) => void;
  addContact: (contact: Omit<TrustedContact, 'id' | 'priority'>) => void;
  updateContact: (id: string, contact: Partial<TrustedContact>) => void;
  deleteContact: (id: string) => void;
  reorderContacts: (contacts: TrustedContact[]) => void;
  updateWillData: (data: Partial<WillData>) => void;
  toggleRecovery: (enabled: boolean) => void;
  updateUser: (data: Partial<AppState['user']>) => void;
  addToast: (message: string, type?: 'success' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AppState>(defaultState);

  const genId = () => Math.random().toString(36).slice(2, 10);

  const addAsset = useCallback((category: 'banks' | 'stocks' | 'insurance', asset: any) => {
    setState(s => ({ ...s, assets: { ...s.assets, [category]: [...s.assets[category], { ...asset, id: genId() }] } }));
  }, []);
  const updateAsset = useCallback((category: 'banks' | 'stocks' | 'insurance', id: string, asset: any) => {
    setState(s => ({ ...s, assets: { ...s.assets, [category]: s.assets[category].map((a: any) => a.id === id ? { ...a, ...asset } : a) } }));
  }, []);
  const deleteAsset = useCallback((category: 'banks' | 'stocks' | 'insurance', id: string) => {
    setState(s => ({ ...s, assets: { ...s.assets, [category]: s.assets[category].filter((a: any) => a.id !== id) } }));
  }, []);
  const addContact = useCallback((contact: Omit<TrustedContact, 'id' | 'priority'>) => {
    setState(s => {
      const priority = s.trustedContacts.length + 1;
      return { ...s, trustedContacts: [...s.trustedContacts, { ...contact, id: genId(), priority }] };
    });
  }, []);
  const updateContact = useCallback((id: string, data: Partial<TrustedContact>) => {
    setState(s => ({ ...s, trustedContacts: s.trustedContacts.map(c => c.id === id ? { ...c, ...data } : c) }));
  }, []);
  const deleteContact = useCallback((id: string) => {
    setState(s => ({
      ...s, trustedContacts: s.trustedContacts.filter(c => c.id !== id).map((c, i) => ({ ...c, priority: i + 1 })),
    }));
  }, []);
  const reorderContacts = useCallback((contacts: TrustedContact[]) => {
    setState(s => ({ ...s, trustedContacts: contacts.map((c, i) => ({ ...c, priority: i + 1 })) }));
  }, []);
  const updateWillData = useCallback((data: Partial<WillData>) => {
    setState(s => ({ ...s, willData: { ...s.willData, ...data } }));
  }, []);
  const toggleRecovery = useCallback((enabled: boolean) => {
    setState(s => ({ ...s, recoveryEnabled: enabled }));
  }, []);
  const updateUser = useCallback((data: Partial<AppState['user']>) => {
    setState(s => ({ ...s, user: { ...s.user, ...data } }));
  }, []);
  const addToast = useCallback((message: string, type: 'success' | 'warning' | 'error' = 'success') => {
    const id = genId();
    setState(s => ({ ...s, toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => {
      setState(s => ({ ...s, toasts: s.toasts.filter(t => t.id !== id) }));
    }, 3000);
  }, []);
  const removeToast = useCallback((id: string) => {
    setState(s => ({ ...s, toasts: s.toasts.filter(t => t.id !== id) }));
  }, []);

  return (
    <AppContext.Provider value={{
      ...state, addAsset, updateAsset, deleteAsset, addContact, updateContact,
      deleteContact, reorderContacts, updateWillData, toggleRecovery, updateUser, addToast, removeToast,
    }}>
      {children}
    </AppContext.Provider>
  );
};
