import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function ChatWidget() {
    const { isAuthenticated } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ sender: 'user' | 'ai', text: string }[]>([
        { sender: 'ai', text: "Hi! I'm MentorAI. Ask me anything about your finances or tax planning." }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen, isTyping]);

    if (!isAuthenticated) return null;

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userText = input.trim();
        setMessages(prev => [...prev, { sender: 'user', text: userText }]);
        setInput('');
        setIsTyping(true);

        try {
            const token = localStorage.getItem('mentorai_token');
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ message: userText })
            });
            const data = await res.json();
            setMessages(prev => [...prev, { sender: 'ai', text: data.reply }]);
        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { sender: 'ai', text: "Connection error. Please try again." }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 100 }}>
            {isOpen ? (
                <div className="glass-panel animate-fade-in-up" style={{ width: '350px', height: '500px', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.4)', borderRadius: '1rem', border: '1px solid var(--glass-border)' }}>
                    {/* Header */}
                    <div style={{ background: 'var(--primary)', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, fontSize: '1rem' }}>
                            <MessageSquare size={18} /> MentorAI Assistant
                        </h3>
                        <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><X size={18} /></button>
                    </div>

                    {/* Messages */}
                    <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--bg-light)' }}>
                        {messages.map((msg, idx) => (
                            <div key={idx} style={{ alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                                <div style={{ background: msg.sender === 'user' ? 'var(--primary)' : 'var(--bg-light-elem)', color: msg.sender === 'user' ? 'white' : 'var(--text-main)', padding: '0.75rem 1rem', borderRadius: '1rem', borderBottomRightRadius: msg.sender === 'user' ? '2px' : '1rem', borderBottomLeftRadius: msg.sender === 'ai' ? '2px' : '1rem', fontSize: '0.9rem', lineHeight: 1.4, border: msg.sender === 'ai' ? '1px solid var(--glass-border)' : 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div style={{ alignSelf: 'flex-start', background: 'var(--bg-light-elem)', padding: '0.75rem 1rem', borderRadius: '1rem', borderBottomLeftRadius: '2px', border: '1px solid var(--glass-border)' }}>
                                <Loader2 size={16} color="var(--primary)" style={{ animation: 'spin 1.5s linear infinite' }} />
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSend} style={{ padding: '0.75rem', background: 'var(--bg-light-elem)', display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--glass-border)' }}>
                        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message..." style={{ flex: 1, background: 'var(--bg-light)', border: '1px solid var(--glass-border)', padding: '0.5rem 1rem', borderRadius: '99px', color: 'var(--text-main)', outline: 'none' }} />
                        <button type="submit" disabled={isTyping || !input.trim()} style={{ background: 'var(--primary)', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', opacity: (isTyping || !input.trim()) ? 0.5 : 1, transition: 'var(--transition)' }}>
                            <Send size={16} style={{ marginLeft: '-2px' }} />
                        </button>
                    </form>
                </div>
            ) : (
                <button onClick={() => setIsOpen(true)} style={{ background: 'var(--primary)', color: 'white', border: 'none', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)', transition: 'var(--transition)' }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                    <MessageSquare size={28} />
                </button>
            )}
        </div>
    );
}
