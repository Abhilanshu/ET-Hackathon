import { ArrowRight, ShieldCheck, Zap, TrendingUp, Lock, CheckCircle, PieChart, Building } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Landing() {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', width: '100%', overflowX: 'hidden' }}>
            {/* Navigation */}
            <nav style={{
                padding: '1.5rem 5%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'var(--bg-glass)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid var(--glass-border)',
                position: 'fixed',
                width: '100%',
                top: 0,
                zIndex: 100
            }}>
                <div className="logo-container" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div className="logo-icon" style={{ background: 'var(--primary)', color: 'white', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>▲</div>
                    <h2 className="logo-text" style={{ fontSize: '1.5rem', fontWeight: 800 }}>Mentor<span className="text-gradient-primary">AI</span></h2>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <Link to="/login" style={{ textDecoration: 'none', color: 'var(--text-main)', fontWeight: 600 }}>Sign In</Link>
                    <Link to="/dashboard" className="btn btn-primary">Get Started</Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section style={{
                position: 'relative',
                paddingTop: '12rem',
                paddingBottom: '8rem',
                paddingInline: '5%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                flex: 1,
                overflow: 'hidden'
            }}>
                {/* Animated Background Blobs */}
                <div className="hero-bg-blob hero-blob-1 animate-blob" />
                <div className="hero-bg-blob hero-blob-2 animate-blob" style={{ animationDelay: '2s' }} />
                <div className="hero-bg-blob hero-blob-3 animate-blob" style={{ animationDelay: '4s' }} />

                <div className="animate-float" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1.25rem', background: 'var(--bg-glass)', border: '1px solid var(--primary-light)', color: 'var(--primary)', borderRadius: '99px', fontSize: '0.9rem', fontWeight: 600, marginBottom: '2.5rem', animation: 'fadeInUp 0.8s forwards' }}>
                    <Zap size={16} fill="currentColor" className="btn-pulse" style={{ borderRadius: '50%' }} /> Welcome to the Future of Personal Finance
                </div>

                <h1 style={{ fontSize: 'clamp(3.5rem, 7vw, 6rem)', maxWidth: '1000px', marginBottom: '1.5rem', lineHeight: 1.05, animation: 'fadeInUp 0.8s 0.1s forwards', opacity: 0, letterSpacing: '-0.03em' }}>
                    Your Financial Command Center, <br /><span className="text-gradient hover-glow" style={{ position: 'relative', zIndex: 1 }}>Automated.</span>
                </h1>

                <p style={{ fontSize: '1.35rem', color: 'var(--text-muted)', maxWidth: '700px', marginBottom: '3.5rem', animation: 'fadeInUp 0.8s 0.2s forwards', opacity: 0, lineHeight: 1.6 }}>
                    MentorAI securely connects to your accounts, optimizes your mutual fund portfolio, minimizes your taxes, and plots your exact escape velocity to financial independence.
                </p>

                <div style={{ display: 'flex', gap: '1.5rem', animation: 'fadeInUp 0.8s 0.3s forwards', opacity: 0, flexWrap: 'wrap', justifyContent: 'center' }}>
                    <Link to="/dashboard" className="btn btn-primary btn-pulse" style={{ padding: '1.2rem 3rem', fontSize: '1.15rem' }}>
                        Enter Command Center <ArrowRight size={20} />
                    </Link>
                    <a href="#features" className="btn btn-outline" style={{ padding: '1.2rem 3rem', fontSize: '1.15rem', background: 'var(--bg-glass)', backdropFilter: 'blur(10px)' }}>
                        See How It Works
                    </a>
                </div>

                <div style={{ marginTop: '4rem', display: 'flex', alignItems: 'center', gap: '3rem', animation: 'fadeInUp 0.8s 0.4s forwards', opacity: 0, padding: '1.5rem 3rem', background: 'var(--bg-glass)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-glass)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-main)', fontSize: '1rem', fontWeight: 500 }}>
                        <Lock size={20} color="var(--primary)" /> Bank-level 256-bit encryption
                    </div>
                    <div style={{ width: '1px', height: '24px', background: 'var(--glass-border)' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-main)', fontSize: '1rem', fontWeight: 500 }}>
                        <ShieldCheck size={20} color="var(--secondary)" /> Zero data monetization guarantee
                    </div>
                </div>
            </section>

            {/* Supported Banks Marquee */}
            <section style={{ padding: '3rem 0', background: 'var(--bg-light-elem)', borderTop: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)', overflow: 'hidden' }}>
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '1.5rem', fontWeight: 500 }}>SECURELY CONNECTS WITH 50+ INSTITUTIONS</p>
                <div className="marquee-container">
                    <div className="marquee-track">
                        {/* Double the list for infinite scrolling */}
                        {[...Array(2)].map((_, i) => (
                            <span key={i} style={{ display: 'inline-flex' }}>
                                <span className="marquee-item"><Building size={24} /> HDFC Bank</span>
                                <span className="marquee-item"><Building size={24} /> ICICI Bank</span>
                                <span className="marquee-item"><Building size={24} /> State Bank of India</span>
                                <span className="marquee-item"><Building size={24} /> Axis Bank</span>
                                <span className="marquee-item"><Building size={24} /> Kotak Mahindra</span>
                                <span className="marquee-item"><Building size={24} /> Zerodha</span>
                                <span className="marquee-item"><Building size={24} /> Groww</span>
                                <span className="marquee-item"><Building size={24} /> Upstox</span>
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it Works Section */}
            <section style={{ padding: '8rem 5%', position: 'relative' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                        <div style={{ display: 'inline-flex', padding: '0.5rem 1rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--secondary)', borderRadius: '99px', fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem' }}>
                            Simple 3-Step Process
                        </div>
                        <h2>How Mentor<span className="text-gradient">AI</span> transforms your wealth.</h2>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
                        {/* Step 1 */}
                        <div className="glass-panel" style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--primary-light)', lineHeight: 1, marginBottom: '1rem' }}>01</div>
                                <h3>Connect your accounts</h3>
                                <p style={{ marginTop: '1rem', fontSize: '1.1rem' }}>Link your bank accounts, EPF, and mutual fund portfolios using our read-only, encrypted bridge. MentorAI analyzes your entire financial lifecycle in seconds.</p>
                                <ul style={{ marginTop: '1.5rem', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-main)' }}>
                                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle size={18} color="var(--primary)" /> Read-only access</li>
                                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle size={18} color="var(--primary)" /> Syncs in 30 seconds</li>
                                </ul>
                            </div>
                            <div style={{ flex: 1, background: 'var(--bg-light-elem)', borderRadius: 'var(--radius-md)', padding: '2rem', textAlign: 'center', border: '1px dashed var(--glass-border)' }}>
                                <ShieldCheck size={80} color="var(--primary)" className="animate-float" style={{ margin: '0 auto' }} />
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="glass-panel" style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexDirection: 'row-reverse' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--primary-light)', lineHeight: 1, marginBottom: '1rem' }}>02</div>
                                <h3>AI detects the leaks</h3>
                                <p style={{ marginTop: '1rem', fontSize: '1.1rem' }}>We cross-reference your investments against taxation rules and overlapping stock holdings to find exactly where you are losing money to unnecessary fees.</p>
                            </div>
                            <div style={{ flex: 1, background: 'var(--bg-light-elem)', borderRadius: 'var(--radius-md)', padding: '2rem', textAlign: 'center', border: '1px dashed var(--glass-border)' }}>
                                <PieChart size={80} color="var(--secondary)" className="animate-float" style={{ margin: '0 auto', animationDelay: '1s' }} />
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="glass-panel" style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--primary-light)', lineHeight: 1, marginBottom: '1rem' }}>03</div>
                                <h3>Execute the Masterplan</h3>
                                <p style={{ marginTop: '1rem', fontSize: '1.1rem' }}>Get step-by-step instructions (or use 1-click execution) to shift funds, optimize taxes, and accelerate your time-to-retirement (FIRE) by years.</p>
                            </div>
                            <div style={{ flex: 1, background: 'var(--bg-light-elem)', borderRadius: 'var(--radius-md)', padding: '2rem', textAlign: 'center', border: '1px dashed var(--glass-border)' }}>
                                <TrendingUp size={80} color="var(--accent)" className="animate-float" style={{ margin: '0 auto', animationDelay: '2s' }} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" style={{ padding: '6rem 5%', background: 'linear-gradient(to bottom, transparent, var(--bg-light-elem))' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <h2>Everything you need. <span className="text-gradient-primary">Nothing you don't.</span></h2>
                    </div>

                    <div className="dashboard-grid" style={{ marginTop: '5rem' }}>
                        <div className="glass-panel stagger-1" style={{ textAlign: 'left', transition: 'transform 0.3s ease, box-shadow 0.3s ease', cursor: 'default' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                                <TrendingUp color="var(--primary)" size={24} />
                            </div>
                            <h3 style={{ fontSize: '1.5rem' }}>FIRE Planner</h3>
                            <p style={{ marginTop: '0.75rem', fontSize: '1.05rem', lineHeight: 1.6 }}>Calculate your 'escape velocity' with precision. Know exactly when you can retire based on current SIPs and mathematically projected inflation rates.</p>
                        </div>

                        <div className="glass-panel stagger-2" style={{ textAlign: 'left', transition: 'transform 0.3s ease, box-shadow 0.3s ease', cursor: 'default' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                                <ShieldCheck color="var(--secondary)" size={24} />
                            </div>
                            <h3 style={{ fontSize: '1.5rem' }}>Tax Wizard</h3>
                            <p style={{ marginTop: '0.75rem', fontSize: '1.05rem', lineHeight: 1.6 }}>Upload your Form 16 and MentorAI will instantly compute whether you should switch to the New Tax Regime or maximize under the Old Regime.</p>
                        </div>

                        <div className="glass-panel stagger-3" style={{ textAlign: 'left', transition: 'transform 0.3s ease, box-shadow 0.3s ease', cursor: 'default' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(244, 63, 94, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                                <Zap color="var(--accent)" size={24} />
                            </div>
                            <h3 style={{ fontSize: '1.5rem' }}>MF X-Ray</h3>
                            <p style={{ marginTop: '0.75rem', fontSize: '1.05rem', lineHeight: 1.6 }}>Identify hidden stock overlaps between your mutual funds using our X-Ray engine and instantly eliminate redundant active fund management fees.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section style={{ padding: '8rem 5%', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                <div className="hero-bg-blob hero-blob-1 animate-blob" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '800px', filter: 'blur(120px)' }} />
                <div className="glass-panel" style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 10, background: 'rgba(255,255,255,0.8)' }}>
                    <h2 style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>Ready to optimize your wealth?</h2>
                    <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '2.5rem' }}>Stop leaving money on the table. Join 50,000+ smart investors using MentorAI.</p>
                    <Link to="/dashboard" className="btn btn-primary btn-pulse" style={{ padding: '1.2rem 4rem', fontSize: '1.25rem' }}>
                        Get Started Free
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ padding: '2rem 5%', textAlign: 'center', borderTop: '1px solid var(--glass-border)', background: 'var(--bg-light)', color: 'var(--text-muted)' }}>
                <p>© 2026 MentorAI Financial. Crafted for absolute clarity.</p>
            </footer>
        </div>
    );
}
