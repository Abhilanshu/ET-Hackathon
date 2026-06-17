import { useState, useEffect, useMemo } from 'react';
import { Lock, Trash2, ShieldAlert, FileText, CheckCircle } from 'lucide-react';

interface AssetNominee {
  id: string;
  assetName: string;
  assetType: 'Savings Account' | 'Mutual Funds' | 'Stocks' | 'Gold' | 'Insurance' | 'EPF/PPF' | 'Others';
  institution: string;
  valuation: number;
  nomineeName: string;
  nomineeContact: string;
  sharePct: number;
}

const ASSET_TYPES = ['Savings Account', 'Mutual Funds', 'Stocks', 'Gold', 'Insurance', 'EPF/PPF', 'Others'] as const;

const FMT = (n: number) => `₹${n.toLocaleString('en-IN')}`;

export default function NomineeVault() {
  const [assets, setAssets] = useState<AssetNominee[]>([
    { id: '1', assetName: 'HDFC Savings Account', assetType: 'Savings Account', institution: 'HDFC Bank', valuation: 320000, nomineeName: 'Aarti Sharma (Spouse)', nomineeContact: '9876543210', sharePct: 100 },
    { id: '2', assetName: 'Nifty ETF Port', assetType: 'Stocks', institution: 'Zerodha', valuation: 450000, nomineeName: 'Rajesh Sharma (Brother)', nomineeContact: '9812345670', sharePct: 50 },
    { id: '3', assetName: 'Term Insurance Plan', assetType: 'Insurance', institution: 'LIC India', valuation: 10000000, nomineeName: 'Aarti Sharma (Spouse)', nomineeContact: '9876543210', sharePct: 100 }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    assetName: '',
    assetType: ASSET_TYPES[0] as AssetNominee['assetType'],
    institution: '',
    valuation: '',
    nomineeName: '',
    nomineeContact: '',
    sharePct: '100'
  });

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('mentorai_nominee_assets');
    if (saved) {
      try { setAssets(JSON.parse(saved)); } catch (e) { console.error(e); }
    }
  }, []);

  const saveAssets = (updated: AssetNominee[]) => {
    setAssets(updated);
    localStorage.setItem('mentorai_nominee_assets', JSON.stringify(updated));
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.assetName || !form.institution || !form.valuation) return;

    const newAsset: AssetNominee = {
      id: Date.now().toString(),
      assetName: form.assetName.trim(),
      assetType: form.assetType,
      institution: form.institution.trim(),
      valuation: Number(form.valuation),
      nomineeName: form.nomineeName.trim() || 'Missing Nominee!',
      nomineeContact: form.nomineeContact.trim() || 'N/A',
      sharePct: form.nomineeName.trim() ? Number(form.sharePct) : 0
    };

    const updated = [...assets, newAsset];
    saveAssets(updated);
    setForm({ assetName: '', assetType: ASSET_TYPES[0], institution: '', valuation: '', nomineeName: '', nomineeContact: '', sharePct: '100' });
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    const updated = assets.filter(a => a.id !== id);
    saveAssets(updated);
  };

  // Calculations
  const nomineeAudit = useMemo(() => {
    const missing = assets.filter(a => !a.nomineeName || a.nomineeName === 'Missing Nominee!' || a.sharePct <= 0);
    const incomplete = assets.filter(a => a.sharePct > 0 && a.sharePct < 100);
    
    return {
      missing,
      incomplete,
      totalAssetsCount: assets.length,
      hasViolations: missing.length > 0 || incomplete.length > 0
    };
  }, [assets]);

  const totalValuationSum = useMemo(() => {
    return assets.reduce((s, a) => s + a.valuation, 0);
  }, [assets]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="animate-fade-in-up">
      {/* Print Wrapper Override styles for browser printing */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-manifest-area, #print-manifest-area * {
            visibility: visible;
          }
          #print-manifest-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Header */}
      <div className="no-print" style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Lock size={40} color="var(--primary)" />
          <span>Nominee Vault & <span className="text-gradient">Legacy Map</span></span>
        </h1>
        <p style={{ marginTop: '0.5rem', fontSize: '1.1rem' }}>
          Securely organize your nominee allocations across all holdings. Avoid the unclaimed wealth trap and export your legal will manifest.
        </p>
      </div>

      <div className="no-print" style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '2rem', alignItems: 'start', marginBottom: '2rem' }}>
        {/* ── Left Column: Config Forms ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Audit Panel */}
          <div className="glass-panel" style={{ borderLeft: `4px solid ${nomineeAudit.hasViolations ? 'var(--accent)' : 'var(--secondary)'}` }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', marginBottom: '1rem' }}>
              {nomineeAudit.hasViolations ? <ShieldAlert color="var(--accent)" /> : <CheckCircle color="var(--secondary)" />}
              Vault Audit Health
            </h3>

            {nomineeAudit.hasViolations ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
                <p style={{ color: 'var(--text-muted)' }}>We flagged issues that could freeze your estate during legal transfer:</p>
                {nomineeAudit.missing.length > 0 && (
                  <div style={{ background: 'rgba(244,63,94,0.1)', color: 'var(--accent)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                    ⚠️ <strong>{nomineeAudit.missing.length} Assets</strong> are missing nominees completely!
                  </div>
                )}
                {nomineeAudit.incomplete.length > 0 && (
                  <div style={{ background: 'rgba(245,158,11,0.1)', color: '#d97706', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                    ⚠️ <strong>{nomineeAudit.incomplete.length} Assets</strong> have under 100% nominee share splits.
                  </div>
                )}
              </div>
            ) : (
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                Perfect score! All registered assets have valid nominees mapped at 100% split.
              </p>
            )}
          </div>

          {/* Add Asset Form */}
          <div className="glass-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem' }}>Register New Asset</h3>
              <button className="btn btn-outline" onClick={() => setShowForm(v => !v)} style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}>
                {showForm ? 'Cancel' : 'Add'}
              </button>
            </div>

            {showForm && (
              <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <input placeholder="Asset Name e.g. HDFC Salary Account" value={form.assetName} onChange={e => setForm({ ...form, assetName: e.target.value })} required />
                
                <select value={form.assetType} onChange={e => setForm({ ...form, assetType: e.target.value as AssetNominee['assetType'] })}>
                  {ASSET_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                </select>

                <input placeholder="Institution e.g. HDFC Bank" value={form.institution} onChange={e => setForm({ ...form, institution: e.target.value })} required />
                <input type="number" placeholder="Valuation (₹)" value={form.valuation} onChange={e => setForm({ ...form, valuation: e.target.value })} required />
                
                <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '0.75rem', marginTop: '0.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <input placeholder="Nominee Full Name (Optional)" value={form.nomineeName} onChange={e => setForm({ ...form, nomineeName: e.target.value })} />
                  <input placeholder="Nominee Contact (Optional)" value={form.nomineeContact} onChange={e => setForm({ ...form, nomineeContact: e.target.value })} />
                  <input type="number" placeholder="Nominee Share Split (%)" min="1" max="100" value={form.sharePct} onChange={e => setForm({ ...form, sharePct: e.target.value })} />
                </div>

                <button type="submit" className="btn btn-primary" style={{ padding: '0.65rem', borderRadius: 'var(--radius-sm)', marginTop: '0.5rem' }}>
                  Save Asset Profile
                </button>
              </form>
            )}

            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', lineHeight: 1.4 }}>
              Nominees defined here are strictly client-side mock configurations for estate blueprint planning.
            </p>
          </div>
        </div>

        {/* ── Right Column: Asset List & Actions ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Actions panel */}
          <div className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Holistic Estate Valuation</p>
              <h2 style={{ fontSize: '2rem' }}>{FMT(totalValuationSum)}</h2>
            </div>
            <button className="btn btn-primary" onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={18} /> Export Legacy Manifest
            </button>
          </div>

          {/* Asset Nominee Registry */}
          <div className="glass-panel">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>Asset Nominee Registry</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {assets.map(item => {
                const isViolating = !item.nomineeName || item.nomineeName === 'Missing Nominee!' || item.sharePct <= 0;
                return (
                  <div 
                    key={item.id} 
                    style={{ 
                      padding: '1rem 1.25rem', 
                      background: 'var(--bg-light-elem)', 
                      borderRadius: 'var(--radius-md)', 
                      border: '1px solid var(--glass-border)',
                      borderLeft: `5px solid ${isViolating ? 'var(--accent)' : 'var(--secondary)'}`
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <div>
                        <strong style={{ fontSize: '1rem', color: 'var(--text-main)' }}>{item.assetName}</strong>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                          ({item.assetType} at {item.institution})
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>{FMT(item.valuation)}</span>
                        <button onClick={() => handleDelete(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div style={{ background: 'var(--bg-light)', padding: '0.6rem 1rem', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Nominee: </span>
                        <strong style={{ color: isViolating ? 'var(--accent)' : 'var(--text-main)' }}>{item.nomineeName}</strong>
                        {item.nomineeContact !== 'N/A' && (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}> (Contact: {item.nomineeContact})</span>
                        )}
                      </div>
                      <span style={{ fontWeight: 700, color: isViolating ? 'var(--accent)' : 'var(--secondary)' }}>
                        Share: {item.sharePct}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Hidden Print Manifest Blueprint Area (visible only during window.print()) ── */}
      <div id="print-manifest-area" style={{ display: 'none', padding: '3rem', color: '#000', fontFamily: 'sans-serif' }}>
        <div style={{ borderBottom: '2px solid #000', paddingBottom: '1.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '2.2rem' }}>LEGAL ESTATE & NOMINEE MANIFEST</h1>
            <p style={{ margin: '0.25rem 0 0 0', color: '#555', fontSize: '0.95rem' }}>Autonomous Legacy Blueprint generated via MentorAI</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontWeight: 'bold' }}>Date Exported: {new Date().toLocaleDateString()}</p>
            <p style={{ margin: '0.2rem 0 0 0', color: '#555', fontSize: '0.85rem' }}>Status: Confirmed Registry</p>
          </div>
        </div>

        <p style={{ fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
          To Whom It May Concern. This document serves as a verified blueprint summary of my financial assets and designated nominees. This statement is prepared to prevent unclaimed wealth issues and guide executors during estate allocation.
        </p>

        <h3 style={{ borderBottom: '1px solid #ddd', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Asset & Nominee Details</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', marginBottom: '3rem' }}>
          <thead>
            <tr style={{ background: '#f5f5f5', borderBottom: '1px solid #ccc' }}>
              <th style={{ textAlign: 'left', padding: '0.75rem' }}>Asset Description</th>
              <th style={{ textAlign: 'left', padding: '0.75rem' }}>Type</th>
              <th style={{ textAlign: 'left', padding: '0.75rem' }}>Institution</th>
              <th style={{ textAlign: 'right', padding: '0.75rem' }}>Est. Value (₹)</th>
              <th style={{ textAlign: 'left', padding: '0.75rem' }}>Designated Nominee</th>
              <th style={{ textAlign: 'right', padding: '0.75rem' }}>Share (%)</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((item, index) => (
              <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>{item.assetName}</td>
                <td style={{ padding: '0.75rem' }}>{item.assetType}</td>
                <td style={{ padding: '0.75rem' }}>{item.institution}</td>
                <td style={{ padding: '0.75rem', textAlign: 'right' }}>{FMT(item.valuation).replace('₹', '')}</td>
                <td style={{ padding: '0.75rem' }}>{item.nomineeName} ({item.nomineeContact})</td>
                <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'bold' }}>{item.sharePct}%</td>
              </tr>
            ))}
            <tr style={{ borderTop: '2px solid #000', fontWeight: 'bold' }}>
              <td colSpan={3} style={{ padding: '1rem 0.75rem', fontSize: '1rem' }}>Total Combined Estate Valuation</td>
              <td style={{ padding: '1rem 0.75rem', textAlign: 'right', fontSize: '1rem' }}>{FMT(totalValuationSum)}</td>
              <td colSpan={2}></td>
            </tr>
          </tbody>
        </table>

        <div style={{ marginTop: '5rem', display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ width: '250px', borderTop: '1px solid #000', textAlign: 'center', paddingTop: '0.5rem' }}>
            <p style={{ margin: 0, fontWeight: 'bold' }}>Signature of Declarant</p>
          </div>
          <div style={{ width: '250px', borderTop: '1px solid #000', textAlign: 'center', paddingTop: '0.5rem' }}>
            <p style={{ margin: 0, fontWeight: 'bold' }}>Signature of Witness</p>
          </div>
        </div>
      </div>
    </div>
  );
}
