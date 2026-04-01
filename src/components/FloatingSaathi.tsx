import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send } from 'lucide-react';

const saathiResponses: Record<string, string> = {
  nominee: "A nominee is the person you designate to receive your assets on your behalf after death. Importantly, a nominee is a trustee—not necessarily the legal owner. The legal ownership is determined by your will or succession laws.",
  insurance: "Common insurance types in India: Term Life (pure protection, large cover at low cost), Health Insurance (medical expenses), Motor Insurance (vehicle damage/theft), ULIP (investment + insurance), and Endowment plans (savings + insurance).",
  "death claim": "To file a death claim: 1) Notify the insurer/bank with the death certificate, 2) Submit the claim form, 3) Provide nominee ID proof, 4) Provide policy/account documents. Most claims resolve in 30–60 days.",
  demat: "A Demat (Dematerialized) account holds your shares and securities in electronic form. It's maintained by depositories NSDL or CDSL. You need a broker account linked to your Demat to trade.",
  executor: "An executor is the person you appoint in your will to carry out your instructions after death. They collect assets, pay debts, and distribute the remainder to beneficiaries.",
  property: "Property transfer after death follows either the will (if one exists) or succession laws. You'll need: death certificate, succession certificate or probate, property documents, and identity proof.",
};

const quickQuestions = [
  "What is a nominee?", "What are different types of insurance?",
  "How does a death claim work?", "What is a demat account?",
  "What is an executor in a will?", "How do I transfer property after death?",
];

interface Message { text: string; from: 'user' | 'bot' }

const getResponse = (q: string) => {
  const lower = q.toLowerCase();
  for (const [key, val] of Object.entries(saathiResponses)) {
    if (lower.includes(key)) return val;
  }
  return "I can help you understand financial and estate planning terms. Try asking about nominees, insurance types, demat accounts, or how death claims work. For complex legal matters, please consult a qualified professional.";
};

const FloatingSaathi = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);

  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages(m => [...m, { text, from: 'user' }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(m => [...m, { text: getResponse(text), from: 'bot' }]);
    }, 600);
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 right-6 z-[100] flex h-[480px] w-80 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-lg max-md:bottom-0 max-md:right-0 max-md:left-0 max-md:top-0 max-md:h-full max-md:w-full max-md:rounded-none">
            <div className="flex items-center justify-between border-b border-border bg-primary px-4 py-3">
              <span className="text-sm font-semibold text-primary-foreground">Saathi — Your Vault Guide</span>
              <button onClick={() => setOpen(false)}><X size={18} className="text-primary-foreground" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground mb-3">Quick questions:</p>
                  {quickQuestions.map(q => (
                    <button key={q} onClick={() => send(q)}
                      className="block w-full text-left text-sm rounded-lg border border-border bg-secondary px-3 py-2 hover:bg-muted transition-colors">
                      {q}
                    </button>
                  ))}
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                    m.from === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground'
                  }`}>{m.text}</div>
                </div>
              ))}
              {typing && (
                <div className="flex justify-start">
                  <div className="flex gap-1 rounded-xl bg-secondary px-4 py-3">
                    <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0ms]" />
                    <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:150ms]" />
                    <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              )}
            </div>
            <div className="border-t border-border p-3 flex gap-2">
              <input value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send(input)}
                placeholder="Ask a question..." className="flex-1 rounded-lg border border-border bg-surface2 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent-light" />
              <button onClick={() => send(input)} className="rounded-lg bg-primary p-2 text-primary-foreground">
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <button onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-[90] flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105">
        {open ? <X size={24} /> : <MessageCircle size={24} />}
      </button>
    </>
  );
};

export default FloatingSaathi;
