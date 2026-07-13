import React, { useEffect, useState } from 'react';
import { Info, GitMerge, Cpu, Terminal, ArrowRight, History, BarChart3, ShieldAlert, Award, FileText, CheckCircle, Database, Leaf } from 'lucide-react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

function Documentation({ theme }) {
  // Render LaTeX math formulas
  useEffect(() => {
    if (window.renderMathInElement) {
      window.renderMathInElement(document.body, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false }
        ]
      });
    }
  }, []);

  // CMD Terminal Text Simulation Loop
  const [terminalLines, setTerminalLines] = useState([]);
  useEffect(() => {
    const lines = [
      'C:\\VIT\\ML\\smart_campus> python main.py',
      '[SYS] Initializing Smart Campus Engine...',
      '[DB] Querying 4,320 rows of campus operational data...',
      '[ML] Training Supervised Models...',
      '     - Linear Regression: MSE = 634.4, R2 = 0.9993',
      '     - XGBoost Regressor: MSE = 712.1, R2 = 0.9991',
      '[ML] Training Anomaly Detector (Isolation Forest)...',
      '     - Contamination set to 0.03 (130 potential anomalies)',
      '[SYS] Model selection complete. Best fit: Linear Regression.',
      '-------------------------------------------------------',
      'CAMPUS STATUS SUMMARY (CMD OUTPUT):',
      '  Total Consumption: 15,405,857 kWh',
      '  Solar Generation : 383,968 kWh',
      '  Estimated Carbon : 12,317.9 tons CO2',
      '  Anomalies Flagged: 131 hours',
      '-------------------------------------------------------',
      'C:\\VIT\\ML\\smart_campus> _'
    ];

    let timer;
    let idx = 0;

    function addNextLine() {
      if (idx < lines.length) {
        setTerminalLines(lines.slice(0, idx + 1));
        idx++;
        timer = setTimeout(addNextLine, 600);
      } else {
        timer = setTimeout(() => {
          idx = 0;
          setTerminalLines([]);
          addNextLine();
        }, 3500);
      }
    }

    addNextLine();
    return () => clearTimeout(timer);
  }, []);

  // Custom inline styles for premium look
  const cardStyle = {
    background: 'var(--panel-bg)',
    border: '1px solid var(--panel-border)',
    borderRadius: '1rem',
    padding: '1.5rem',
    boxShadow: '0 10px 30px var(--shadow-color)',
    transition: 'all 0.3s ease',
    marginBottom: '1.5rem'
  };

  const badgeStyle = {
    background: 'var(--accent-indigo)20',
    color: 'var(--accent-indigo)',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    marginBottom: '8px'
  };

  return (
    <div className="fade-in-up" style={{ paddingBottom: '5rem', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      
      {/* Intro Header */}
      <div style={{ ...cardStyle, background: 'linear-gradient(135deg, var(--panel-bg), rgba(99, 102, 241, 0.05))', display: 'flex', flexDirection: 'column', gap: '0.75rem', borderLeft: '4px solid var(--accent-indigo)', marginBottom: 0 }}>
        <div style={badgeStyle}>
          <Award size={14} /> Documentation Center
        </div>
        <h1 style={{ fontSize: '2rem', margin: 0, fontWeight: 700, fontFamily: 'Outfit' }}>Smart Campus Architecture and ML Guide</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxW: '800px', lineHeight: 1.6 }}>
          Welcome to the technical hub of the Smart Campus Twin. Below is a comprehensive breakdown of the project evolution timeline, database structure, machine learning engines, mathematical formulas, and data visualizations.
        </p>
      </div>

      {/* SECTION 1: THE DEVELOPMENT JOURNEY (TIMELINE) */}
      <section style={cardStyle}>
        <h2 style={{ fontFamily: 'Outfit', fontWeight: 600, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <History size={22} style={{ color: 'var(--accent-indigo)' }} />
          The Development Journey
        </h2>
        
        <div style={{ position: 'relative', paddingLeft: '2.5rem', borderLeft: '2px solid var(--panel-border)', marginLeft: '10px' }}>
          
          {/* Timeline Step 1: CMD PROTOTYPE */}
          <div style={{ marginBottom: '4rem', position: 'relative' }}>
            <div style={{ position: 'absolute', left: '-3.25rem', top: '2px', background: 'var(--panel-bg)', border: '2px solid #94a3b8', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '0.75rem', fontWeight: 'bold' }}>1</div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h3 style={{ margin: 0, fontWeight: 600, fontSize: '1.2rem' }}>Phase 1: CLI Prototype (Command Line Interface)</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', background: 'rgba(148, 163, 184, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>Initial Stage</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                The project began as a script-only Python application. Raw stats (Gross Electricity Consumption, Solar Generation, Temperature, and Occupancy Counts) were calculated offline and printed directly in a command-line terminal interface.
              </p>
              
              {/* CMD Simulator Mockup */}
              <div style={{
                background: '#0f172a',
                borderRadius: '8px',
                border: '1px solid #334155',
                padding: '1.2rem',
                fontFamily: 'Courier New, monospace',
                fontSize: '0.85rem',
                color: '#38bdf8',
                boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.8)',
                minHeight: '260px',
                overflowY: 'auto'
              }}>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', borderBottom: '1px solid #1e293b', paddingBottom: '6px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }}></span>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#eab308' }}></span>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e' }}></span>
                  <span style={{ color: '#64748b', fontSize: '0.7rem', marginLeft: '10px' }}>Command Prompt - python main.py</span>
                </div>
                {terminalLines.map((line, idx) => (
                  <div key={idx} style={{ 
                    lineHeight: '1.4', 
                    color: line.startsWith('[ML]') ? '#eab308' : line.startsWith('[SYS]') ? '#22c55e' : line.startsWith('[DB]') ? '#a855f7' : '#e2e8f0' 
                  }}>
                    {line}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Timeline Step 2: STATIC HTML */}
          <div style={{ marginBottom: '4rem', position: 'relative' }}>
            <div style={{ position: 'absolute', left: '-3.25rem', top: '2px', background: 'var(--panel-bg)', border: '2px solid var(--accent-cyan)', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-cyan)', fontSize: '0.75rem', fontWeight: 'bold' }}>2</div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h3 style={{ margin: 0, fontWeight: 600, fontSize: '1.2rem' }}>Phase 2: Static HTML Interface</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', background: 'rgba(6, 182, 212, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>Web Migration</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                To make the database human-readable, the tool migrated to a lightweight HTML frontend. We integrated simple tabular layouts and static visualizations using plain styling, allowing users to scroll through campus parameters and submit offline form values to see predictions.
              </p>
              
              {/* HTML Simulator Mockup */}
              <div style={{
                background: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                padding: '1.2rem',
                color: '#334155',
                fontFamily: 'serif',
                boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                minHeight: '260px'
              }}>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '15px', borderBottom: '2px solid #cbd5e1', paddingBottom: '8px', fontFamily: 'sans-serif' }}>
                  <span style={{ color: '#0284c7', fontSize: '0.75rem', fontWeight: 'bold' }}>📄 file:///C:/VIT/ML/index.html</span>
                </div>
                <h2 style={{ fontSize: '1.5rem', color: '#1e3a8a', borderBottom: '1px solid #1e3a8a', paddingBottom: '4px', margin: '0 0 10px 0' }}>Campus Data View</h2>
                <div style={{ display: 'flex', gap: '15px', fontSize: '0.85rem' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #94a3b8' }}>
                    <thead>
                      <tr style={{ background: '#e2e8f0' }}>
                        <th style={{ border: '1px solid #94a3b8', padding: '6px' }}>Date</th>
                        <th style={{ border: '1px solid #94a3b8', padding: '6px' }}>Total Elec</th>
                        <th style={{ border: '1px solid #94a3b8', padding: '6px' }}>Temp (°C)</th>
                        <th style={{ border: '1px solid #94a3b8', padding: '6px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ border: '1px solid #94a3b8', padding: '6px' }}>2026-06-01</td>
                        <td style={{ border: '1px solid #94a3b8', padding: '6px' }}>15,405 kWh</td>
                        <td style={{ border: '1px solid #94a3b8', padding: '6px' }}>28.5</td>
                        <td style={{ border: '1px solid #94a3b8', padding: '6px', color: '#0000ee', textDecoration: 'underline', cursor: 'pointer' }}>View Details</td>
                      </tr>
                      <tr style={{ background: '#f1f5f9' }}>
                        <td style={{ border: '1px solid #94a3b8', padding: '6px' }}>2026-06-02</td>
                        <td style={{ border: '1px solid #94a3b8', padding: '6px' }}>16,210 kWh</td>
                        <td style={{ border: '1px solid #94a3b8', padding: '6px' }}>29.1</td>
                        <td style={{ border: '1px solid #94a3b8', padding: '6px', color: '#0000ee', textDecoration: 'underline', cursor: 'pointer' }}>View Details</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div style={{ marginTop: '15px', padding: '10px', background: '#fef08a', border: '1px dashed #ca8a04', fontSize: '0.8rem', borderRadius: '4px' }}>
                  <strong>Note:</strong> Data is currently loaded from a static Excel file. Models must be re-run manually.
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Step 3: REACT + FASTAPI */}
          <div style={{ marginBottom: '4rem', position: 'relative' }}>
            <div style={{ position: 'absolute', left: '-3.25rem', top: '2px', background: 'var(--panel-bg)', border: '2px solid var(--accent-indigo)', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-indigo)', fontSize: '0.75rem', fontWeight: 'bold' }}>3</div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h3 style={{ margin: 0, fontWeight: 600, fontSize: '1.2rem' }}>Phase 3: React SPA & FastAPI Server</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-indigo)', background: 'rgba(99, 102, 241, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>Decoupled Architecture</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                The stack was completely overhauled into a modern, single-page React app served by Vite, powered by a FastAPI python backend. Data storage was migrated from static spreadsheet exports to a high-speed SQLite database engine, allowing quick sorting, custom paginated API queries, and interactive line charts using Chart.js.
              </p>
              
              {/* React / API Mockup Visualizer */}
              <div style={{
                background: 'var(--panel-bg)',
                borderRadius: '8px',
                border: '1px solid var(--panel-border)',
                padding: '1.2rem',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                minHeight: '140px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-around',
                flexWrap: 'wrap',
                gap: '1.5rem'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(6, 182, 212, 0.1)', border: '1px solid var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-cyan)' }}>
                    <BarChart3 size={24} />
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>React SPA SPA</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Vite Frontend (Port 3000)</span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--accent-indigo)' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', background: 'rgba(99, 102, 241, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>GET /api/data</span>
                  <ArrowRight size={18} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid var(--accent-indigo)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-indigo)' }}>
                    <GitMerge size={24} />
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>FastAPI Engine</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Python API Server (Port 5000)</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--accent-cyan)' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', background: 'rgba(6, 182, 212, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>SQLite Select</span>
                  <ArrowRight size={18} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--accent-emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-emerald)' }}>
                    <Database size={24} />
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>SQLite Database</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>smart_campus.db (Stored Data)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Step 4: SUSTAINABILITY & ML ENHANCEMENTS */}
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: '-3.25rem', top: '2px', background: 'var(--panel-bg)', border: '2px solid var(--accent-emerald)', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-emerald)', fontSize: '0.75rem', fontWeight: 'bold' }}>4</div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h3 style={{ margin: 0, fontWeight: 600, fontSize: '1.2rem' }}>Phase 4: Sustainability & ML Enhancements</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>Latest Release</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                Our latest release focuses strictly on clean energy metrics and outlier visibility. We migrated our model target variable from gross consumption to Net Grid Usage and engineered a custom Isolation Forest anomaly model.
              </p>
              
              {/* Sustainability Cards Mockup */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
              }}>
                <div style={{ ...cardStyle, borderLeft: '4px solid var(--accent-emerald)', marginBottom: 0, padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <span>CARBON SAVED</span>
                    <Leaf size={14} style={{ color: 'var(--accent-emerald)' }} />
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>12.3 Tons CO2</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Equivalent to 55 trees planted</div>
                </div>
                <div style={{ ...cardStyle, borderLeft: '4px solid var(--accent-rose)', marginBottom: 0, padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <span>ANOMALIES SPOTTED</span>
                    <ShieldAlert size={14} style={{ color: 'var(--accent-rose)' }} />
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>131 Alerts</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Highlighted by Isolation Forest</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 2: SYSTEM ARCHITECTURE */}
      <section style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
          <GitMerge size={22} style={{ color: 'var(--accent-indigo)' }} />
          <h2 style={{ margin: 0, fontFamily: 'Outfit', fontWeight: 600 }}>System Architecture</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.2rem', borderRadius: '8px', border: '1px solid var(--panel-border)' }}>
            <h4 style={{ margin: '0 0 10px 0', color: 'var(--accent-indigo)', fontWeight: 600 }}>Decoupled Client-Server Pipeline</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6 }}>
              The application runs as a fully decoupled client-server web app:
            </p>
            <ul style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6, paddingLeft: '1.2rem', marginTop: '0.5rem' }}>
              <li><strong>Python FastAPI Backend:</strong> Serves the API on port 5000, connecting to SQLite and running machine learning inference on demand using <code>joblib</code> models.</li>
              <li><strong>React SPA Client:</strong> Renders on port 3000/5173, providing sorting filters, paginated tables, and interactive graphs.</li>
              <li><strong>SQLite Database Engine:</strong> Houses the campus energy profiles, pre-calculated net grid usage, and anomaly scores.</li>
            </ul>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.2rem', borderRadius: '8px', border: '1px solid var(--panel-border)' }}>
            <h4 style={{ margin: '0 0 10px 0', color: 'var(--accent-indigo)', fontWeight: 600 }}>Startup Commands</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem', lineHeight: 1.6 }}>
              Both the FastAPI backend server and Vite frontend boot concurrently via a single CLI instruction executed in the root folder:
            </p>
            <pre style={{ background: '#1e293b', border: '1px solid var(--panel-border)', padding: '1rem', borderRadius: '0.5rem', color: '#f8fafc', overflowX: 'auto', fontSize: '0.8rem' }}>
              <code>npm start</code>
            </pre>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '1rem', lineHeight: 1.5 }}>
              This utilizes <code>concurrently</code> to start both Node and Python servers in a single terminal.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 3: TECH STACK & DATABASE SCHEMA */}
      <section style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
          <Database size={22} style={{ color: 'var(--accent-indigo)' }} />
          <h2 style={{ margin: 0, fontFamily: 'Outfit', fontWeight: 600 }}>Technical Stack and Database Schema</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          
          {/* Tech Stack Details */}
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.2rem', borderRadius: '8px', border: '1px solid var(--panel-border)' }}>
            <h4 style={{ margin: '0 0 10px 0', color: 'var(--accent-cyan)', fontWeight: 600 }}>Project Tech Stack</h4>
            <ul style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6, paddingLeft: '1.2rem', margin: 0 }}>
              <li><strong>Frontend:</strong> React 19 (for modular UI components), Vite 8 (for ultra-fast bundling and Hot Module Replacement), Chart.js 4 and React-Chartjs-2 (for data visualization), Lucide React (for premium vector icons).</li>
              <li><strong>Backend:</strong> Python 3.10+, FastAPI (high-performance asynchronous framework), Uvicorn (ASGI web server).</li>
              <li><strong>Machine Learning:</strong> Scikit-Learn (for Isolation Forest anomaly classifier and Linear Regression), XGBoost (for advanced regression tree modeling), Pandas and NumPy (for data loading and clean preprocessing).</li>
            </ul>
          </div>

          {/* Database Schema */}
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.2rem', borderRadius: '8px', border: '1px solid var(--panel-border)' }}>
            <h4 style={{ margin: '0 0 10px 0', color: 'var(--accent-cyan)', fontWeight: 600 }}>SQLite Schema (`campus_data`)</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '8px', lineHeight: 1.5 }}>
              The SQLite table contains hourly campus logs with the following core columns:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'monospace', background: 'rgba(0,0,0,0.1)', padding: '10px', borderRadius: '6px' }}>
              <div>
                <strong>Column (Type)</strong>
                <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', margin: '4px 0' }} />
                <div>Date (TEXT)</div>
                <div>Time (TEXT)</div>
                <div>Day (TEXT)</div>
                <div>Electricity_Consumption_kWh (INT)</div>
                <div>Solar_Generation_kWh (INT)</div>
              </div>
              <div>
                <strong>Column (Type)</strong>
                <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', margin: '4px 0' }} />
                <div>Net_Grid_Usage_kWh (INT)</div>
                <div>Temperature_C (REAL)</div>
                <div>Humidity_pct (REAL)</div>
                <div>Is_Anomaly (INT)</div>
                <div>AB[1-5]/MAB[1-4]_Students (INT)</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: DASHBOARD KPI CARDS REFERENCE */}
      <section style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
          <FileText size={22} style={{ color: 'var(--accent-indigo)' }} />
          <h2 style={{ margin: 0, fontFamily: 'Outfit', fontWeight: 600 }}>Dashboard KPI Cards Reference</h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          The top row of the dashboard displays 6 essential operational key performance indicators (KPIs) calculated dynamically from the filtered active dataset:
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.2rem' }}>
          
          <div style={{ background: 'rgba(255,255,255,0.01)', padding: '1rem', borderRadius: '8px', border: '1px dashed var(--panel-border)' }}>
            <h5 style={{ margin: '0 0 4px 0', fontWeight: 600, color: 'var(--text-primary)' }}>1. Total Net Grid Usage</h5>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: 0, lineHeight: 1.5 }}>
              Calculates the total sum of net energy drawn from the public utility grid. Used for matching energy billing structures.
            </p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.01)', padding: '1rem', borderRadius: '8px', border: '1px dashed var(--panel-border)' }}>
            <h5 style={{ margin: '0 0 4px 0', fontWeight: 600, color: 'var(--text-primary)' }}>2. Clean Solar Generation</h5>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: 0, lineHeight: 1.5 }}>
              The total aggregated solar energy generated on campus roofs. Highlights clean energy offsets.
            </p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.01)', padding: '1rem', borderRadius: '8px', border: '1px dashed var(--panel-border)' }}>
            <h5 style={{ margin: '0 0 4px 0', fontWeight: 600, color: 'var(--text-primary)' }}>3. Solar Offset Percentage</h5>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: 0, lineHeight: 1.5 }}>
              The proportion of gross energy footprint met by solar: <code>(Total Solar / Gross Consumption) * 100</code>.
            </p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.01)', padding: '1rem', borderRadius: '8px', border: '1px dashed var(--panel-border)' }}>
            <h5 style={{ margin: '0 0 4px 0', fontWeight: 600, color: 'var(--text-primary)' }}>4. Peak Grid Demand</h5>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0, lineHeight: 1.5 }}>
              The absolute maximum electricity consumed in a single hour, flagging high-stress peak demand intervals.
            </p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.01)', padding: '1rem', borderRadius: '8px', border: '1px dashed var(--panel-border)' }}>
            <h5 style={{ margin: '0 0 4px 0', fontWeight: 600, color: 'var(--text-primary)' }}>5. Average Temperature</h5>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: 0, lineHeight: 1.5 }}>
              The mean outdoor temperature across the selected time period. Helps explain season-specific heating/cooling grid loads.
            </p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.01)', padding: '1rem', borderRadius: '8px', border: '1px dashed var(--panel-border)' }}>
            <h5 style={{ margin: '0 0 4px 0', fontWeight: 600, color: 'var(--text-primary)' }}>6. Anomalies Spotted</h5>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: 0, lineHeight: 1.5 }}>
              The total count of hourly records flagged as outliers by the unsupervised Isolation Forest model, guiding focus to periods of resource waste.
            </p>
          </div>

        </div>
      </section>

      {/* SECTION 5: MACHINE LEARNING & MATHEMATICS */}
      <section style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
          <Cpu size={22} style={{ color: 'var(--accent-indigo)' }} />
          <h2 style={{ margin: 0, fontFamily: 'Outfit', fontWeight: 600 }}>Machine Learning and Mathematics</h2>
        </div>
        
        {/* ML Models explanation */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.2rem', borderRadius: '8px', border: '1px solid var(--panel-border)' }}>
            <h4 style={{ margin: '0 0 10px 0', color: 'var(--accent-cyan)', fontWeight: 600 }}>Predictive Regressor (Net Grid Forecasting)</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6 }}>
              The ML pipeline evaluates four regression models: Linear Regression, Decision Trees, Random Forest, and Gradient Boosting (XGBoost).
            </p>
            <div style={{ margin: '10px 0', padding: '10px', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '6px', borderLeft: '3px solid var(--accent-indigo)', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              <strong>MSE Optimization Focus:</strong> Minimizing Mean Squared Error (MSE) is the core objective of this project. By squaring the differences between predictions and actual values, the training pipeline heavily penalizes large forecasting misses. This is vital for grid planning to avoid power deficits or under-estimating peak loads.
            </div>
            <ul style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 1.6, paddingLeft: '1.2rem', margin: '8px 0 0 0' }}>
              <li><strong>Selection Criteria:</strong> The pipeline automatically deploys the model with the lowest validation MSE (currently <strong>Linear Regression</strong> with MSE = <code>634.4</code> and R² = <code>0.9993</code>, compared to Ridge Regression's MSE = <code>638.1</code>).</li>
              <li><strong>Inputs:</strong> Temperature, humidity, day category, active laboratory counts, and student occupancy schedules.</li>
            </ul>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.2rem', borderRadius: '8px', border: '1px solid var(--panel-border)' }}>
            <h4 style={{ margin: '0 0 10px 0', color: 'var(--accent-rose)', fontWeight: 600 }}>Outlier Detection (Isolation Forest)</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6 }}>
              Unsupervised anomalies are flagged using an <strong>Isolation Forest</strong> classifier.
            </p>
            <div style={{ margin: '10px 0', padding: '10px', background: 'rgba(244, 63, 94, 0.05)', borderRadius: '6px', borderLeft: '3px solid var(--accent-rose)', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              <strong>Path-Length Isolation Focus:</strong> Instead of constructing normal profiles, Isolation Forest isolates outliers by recursively partitioning random features. Outliers require significantly fewer splits (shorter path lengths) to isolate in tree structures, making detection fast and unsupervised.
            </div>
            <ul style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 1.6, paddingLeft: '1.2rem', margin: '8px 0 0 0' }}>
              <li><strong>Contamination Metric:</strong> Hard-coded at <code>0.03</code> (3% expected anomaly rate), which flags exactly 130 operational hours of high energy leakage.</li>
              <li><strong>Supervised Classifier:</strong> Once anomalies are isolated, a supervised <strong>Logistic Regression</strong> model is trained to classify new inputs as normal or anomalous (F1-score = <code>0.44</code>, Accuracy = <code>97.1%</code>).</li>
              <li><strong>Detection Vectors:</strong> Evaluates net grid loads alongside hourly temperatures to detect anomalies like active empty buildings or HVAC leaks.</li>
            </ul>
          </div>
        </div>

        {/* Formulas display */}
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--panel-border)' }}>
          <h4 style={{ margin: '0 0 1.5rem 0', fontWeight: 600, fontFamily: 'Outfit' }}>Core System Mathematics</h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            <div>
              <h5 style={{ margin: '0 0 10px 0', color: 'var(--accent-indigo)' }}>Net Grid Demand</h5>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                Net grid load represents the electricity drawn from public lines after subtracting clean solar generation offsets:
              </p>
              <div style={{ margin: '15px 0', fontSize: '1rem', textAlign: 'center' }}>
                {"$$\\text{Net\\_Grid\\_Usage} = \\text{Electricity\\_Consumption} - \\text{Solar\\_Generation}$$"}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.01)', padding: '10px', borderRadius: '6px', border: '1px solid var(--panel-border)', marginTop: '10px' }}>
                <strong style={{ display: 'block', marginBottom: '4px', color: 'var(--text-primary)' }}>Legend:</strong>
                <ul style={{ paddingLeft: '1.2rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <li><strong>Net_Grid_Usage:</strong> Net power imported from the municipal utility grid (kWh).</li>
                  <li><strong>Electricity_Consumption:</strong> Gross energy consumed by the entire campus (kWh).</li>
                  <li><strong>Solar_Generation:</strong> Total clean solar power generated by campus rooftop arrays (kWh).</li>
                </ul>
              </div>
            </div>

            <div>
              <h5 style={{ margin: '0 0 10px 0', color: 'var(--accent-indigo)' }}>Carbon Footprint Calculation</h5>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                {"Greenhouse gas impact is calculated by applying a standard grid emission coefficient ($0.82 \\text{ kg CO}_2\\text{/kWh}$):"}
              </p>
              <div style={{ margin: '15px 0', fontSize: '1rem', textAlign: 'center' }}>
                {"$$\\text{CO}_2\\text{ (tons)} = \\frac{\\text{Net\\_Grid\\_Usage (kWh)} \\times 0.82}{1000}$$"}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.01)', padding: '10px', borderRadius: '6px', border: '1px solid var(--panel-border)', marginTop: '10px' }}>
                <strong style={{ display: 'block', marginBottom: '4px', color: 'var(--text-primary)' }}>Legend:</strong>
                <ul style={{ paddingLeft: '1.2rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <li><strong>CO₂ (tons):</strong> Total greenhouse gas footprint measured in metric tons.</li>
                  <li><strong>0.82:</strong> {"Regional carbon emissions factor ($0.82\\text{ kg CO}_2$ released per kWh drawn)."}</li>
                  <li><strong>1000:</strong> Conversion divisor to scale kilograms into metric tons.</li>
                </ul>
              </div>
            </div>
          </div>

          <hr style={{ border: 'none', borderBottom: '1px dashed var(--panel-border)', margin: '1.5rem 0' }} />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            <div>
              <h5 style={{ margin: '0 0 10px 0', color: 'var(--accent-indigo)' }}>Model Evaluation Metrics</h5>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                Validation is computed using Mean Squared Error (MSE) and $R^2$ (coefficient of determination):
              </p>
              <div style={{ margin: '15px 0', fontSize: '1rem', textAlign: 'center' }}>
                {"$$\\text{MSE} = \\frac{1}{n}\\sum_{i=1}^{n}(y_i - \\hat{y}_i)^2$$"}
                {"$$\\text{R}^2 = 1 - \\frac{\\sum (y_i - \\hat{y}_i)^2}{\\sum (y_i - \\bar{y})^2}$$"}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.01)', padding: '10px', borderRadius: '6px', border: '1px solid var(--panel-border)', marginTop: '10px' }}>
                <strong style={{ display: 'block', marginBottom: '4px', color: 'var(--text-primary)' }}>Legend:</strong>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <ul style={{ paddingLeft: '1.2rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <li><strong>MSE:</strong> Mean Squared Error (closer to 0 is better).</li>
                    <li><strong>R²:</strong> R-squared score (goodness of fit, scale 0 to 1).</li>
                    <li><strong>n:</strong> Total validation sample size (hours).</li>
                  </ul>
                  <ul style={{ paddingLeft: '1.2rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <li><strong>yᵢ:</strong> Actual observed grid usage at hour $i$.</li>
                    <li><strong>ŷᵢ:</strong> Predicted grid usage at hour $i$.</li>
                    <li><strong>ȳ:</strong> Mean (average) of all observed usage rows.</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h5 style={{ margin: '0 0 10px 0', color: 'var(--accent-indigo)' }}>Feature Dimensionality Reduction</h5>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                Aggregating classrooms reduces feature vectors to prevent regression model overfitting:
              </p>
              <div style={{ margin: '15px 0', fontSize: '1rem', textAlign: 'center' }}>
                {"$$\\text{Total\\_Students} = \\sum_{k=1}^{5} \\text{AB}_k + \\sum_{m=1}^{4} \\text{MAB}_m$$"}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.01)', padding: '10px', borderRadius: '6px', border: '1px solid var(--panel-border)', marginTop: '10px' }}>
                <strong style={{ display: 'block', marginBottom: '4px', color: 'var(--text-primary)' }}>Legend:</strong>
                <ul style={{ paddingLeft: '1.2rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <li><strong>Total_Students:</strong> Consolidated student headcount on campus.</li>
                  <li><strong>ABₖ:</strong> Occupancy of Academic Block $k$ ($k$ ranges from 1 to 5).</li>
                  <li><strong>MAB_m:</strong> Occupancy of M. Academic Block $m$ ($m$ ranges from 1 to 4).</li>
                  <li><strong>Σ:</strong> Summation operator (sums values over the designated range).</li>
                </ul>
              </div>
            </div>
          </div>

          <hr style={{ border: 'none', borderBottom: '1px dashed var(--panel-border)', margin: '1.5rem 0' }} />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            <div>
              <h5 style={{ margin: '0 0 10px 0', color: 'var(--accent-indigo)' }}>Logistic Regression (Anomaly Classification)</h5>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                Predicts whether a given operational context is anomalous using the Logistic Sigmoid activation function:
              </p>
              <div style={{ margin: '15px 0', fontSize: '1rem', textAlign: 'center' }}>
                {"$$p = \\sigma(z) = \\frac{1}{1 + e^{-z}}$$"}
                {"$$z = \\beta_0 + \\beta_1 x_1 + \\beta_2 x_2 + \\dots + \\beta_p x_p$$"}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.01)', padding: '10px', borderRadius: '6px', border: '1px solid var(--panel-border)', marginTop: '10px' }}>
                <strong style={{ display: 'block', marginBottom: '4px', color: 'var(--text-primary)' }}>Legend:</strong>
                <ul style={{ paddingLeft: '1.2rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <li><strong>p:</strong> Probability of the input pattern being an anomaly (if $p \\ge 0.5$, classified as 1).</li>
                  <li><strong>σ(z):</strong> Sigmoid function that bounds any real value into a range between 0 and 1.</li>
                  <li><strong>z:</strong> Net log-odds computed as the linear combination of inputs and model weights.</li>
                  <li><strong>βⱼ:</strong> Trained weight coefficient assigned to the input feature $x_j$.</li>
                </ul>
              </div>
            </div>

            <div>
              <h5 style={{ margin: '0 0 10px 0', color: 'var(--accent-indigo)' }}>Ridge Regression (L2 Regularization)</h5>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                Shrinks regression coefficients toward zero to improve generalization and counter multi-collinearity:
              </p>
              <div style={{ margin: '15px 0', fontSize: '1rem', textAlign: 'center' }}>
                {"$$\\text{Loss}_{\\text{Ridge}} = \\sum_{i=1}^{n}(y_i - \\hat{y}_i)^2 + \\alpha \\sum_{j=1}^{p} \\beta_j^2$$"}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.01)', padding: '10px', borderRadius: '6px', border: '1px solid var(--panel-border)', marginTop: '10px' }}>
                <strong style={{ display: 'block', marginBottom: '4px', color: 'var(--text-primary)' }}>Legend:</strong>
                <ul style={{ paddingLeft: '1.2rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <li><strong>Loss_Ridge:</strong> The combined training cost objective to minimize.</li>
                  <li><strong>α (Alpha):</strong> Tuning parameter controlling regularization penalty strength.</li>
                  <li><strong>βⱼ²:</strong> Squared magnitude of weights (shrinks large weights to prevent overfitting).</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* ML Diagnostic Plots */}
        <div style={{ marginTop: '2rem', background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--panel-border)' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', fontWeight: 600, fontFamily: 'Outfit', color: 'var(--accent-indigo)' }}>
            Model Diagnostics & Regression Visualizations
          </h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            The following diagnostic charts are generated in real-time by the Python ML pipeline during training and model evaluation. They plot the regression model fit, error distributions, and residuals on the validation set.
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            <div style={{ background: 'var(--panel-bg)', padding: '10px', borderRadius: '8px', border: '1px solid var(--panel-border)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '8px', color: 'var(--text-primary)' }}>
                Actual vs. Predicted Consumption
              </span>
              <img src="/api/plots/actual_vs_predicted.png" alt="Actual vs Predicted" style={{ width: '100%', borderRadius: '6px', border: '1px solid var(--panel-border)' }} onError={(e) => e.target.style.display = 'none'} />
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginTop: '6px' }}>
                Scatter plot mapping actual values against the regression model predictions. The identity line indicates a perfect fit.
              </span>
            </div>

            <div style={{ background: 'var(--panel-bg)', padding: '10px', borderRadius: '8px', border: '1px solid var(--panel-border)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '8px', color: 'var(--text-primary)' }}>
                Model Comparison - MSE
              </span>
              <img src="/api/plots/model_comparison_mse.png" alt="Model Comparison MSE" style={{ width: '100%', borderRadius: '6px', border: '1px solid var(--panel-border)' }} onError={(e) => e.target.style.display = 'none'} />
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginTop: '6px' }}>
                Mean Squared Error (MSE) comparison across all candidate regressor algorithms evaluated.
              </span>
            </div>

            <div style={{ background: 'var(--panel-bg)', padding: '10px', borderRadius: '8px', border: '1px solid var(--panel-border)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '8px', color: 'var(--text-primary)' }}>
                Residual Plot
              </span>
              <img src="/api/plots/residual_plot.png" alt="Residual Plot" style={{ width: '100%', borderRadius: '6px', border: '1px solid var(--panel-border)' }} onError={(e) => e.target.style.display = 'none'} />
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginTop: '6px' }}>
                Checks for heteroscedasticity. Points should be randomly scattered around the center line.
              </span>
            </div>

            <div style={{ background: 'var(--panel-bg)', padding: '10px', borderRadius: '8px', border: '1px solid var(--panel-border)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '8px', color: 'var(--text-primary)' }}>
                Prediction Error Profile
              </span>
              <img src="/api/plots/prediction_error_plot.png" alt="Prediction Error Plot" style={{ width: '100%', borderRadius: '6px', border: '1px solid var(--panel-border)' }} onError={(e) => e.target.style.display = 'none'} />
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginTop: '6px' }}>
                Compares the sorted actual data points with the predicted values to locate regression fitting margins.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: VISUALIZATIONS GUIDE */}
      <section style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
          <BarChart3 size={22} style={{ color: 'var(--accent-indigo)' }} />
          <h2 style={{ margin: 0, fontFamily: 'Outfit', fontWeight: 600 }}>Visualizations Guide</h2>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
          
          {/* Heatmap Card */}
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.2rem', borderRadius: '8px', border: '1px solid var(--panel-border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h4 style={{ margin: '0', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-indigo)' }}></span>
              Net Grid Demand Heatmap
            </h4>
            
            {/* Mini Heatmap Visualization */}
            <div style={{ display: 'grid', gridTemplateRows: 'repeat(3, 1fr)', gap: '2px', background: 'rgba(0,0,0,0.1)', padding: '8px', borderRadius: '4px' }}>
              {['Mon', 'Wed', 'Fri'].map((d, i) => (
                <div key={d} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', width: '22px' }}>{d}</span>
                  <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '2px' }}>
                    {Array.from({ length: 12 }).map((_, j) => {
                      const colors = [
                        'rgba(99, 102, 241, 0.2)',  // low
                        'rgba(99, 102, 241, 0.5)',  // med
                        'rgba(244, 63, 94, 0.7)',   // high
                        'rgba(244, 63, 94, 0.9)'    // peak
                      ];
                      // Choose pseudo-random colors to simulate demand peaks in the middle of the day
                      const colorIndex = j > 3 && j < 9 ? (j % 2 === 0 ? 3 : 2) : (j % 2 === 0 ? 0 : 1);
                      return (
                        <div 
                          key={j} 
                          style={{ 
                            height: '10px', 
                            backgroundColor: colors[colorIndex], 
                            borderRadius: '1px' 
                          }} 
                          title="Simulated demand block" 
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6, margin: 0 }}>
              Plots Day-of-Week vs Hour-of-Day using an indigo-to-rose color scale. Grey boxes indicate filters. Allows managers to identify hourly peak load hours, check for high off-peak overnight usage, and optimize solar offset matches.
            </p>
          </div>

          {/* Zone Breakdown Card */}
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.2rem', borderRadius: '8px', border: '1px solid var(--panel-border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h4 style={{ margin: '0', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-cyan)' }}></span>
              Campus Zone Breakdown
            </h4>
            
            {/* Mini Doughnut Chart */}
            <div style={{ height: '80px', position: 'relative', display: 'flex', justifyContent: 'center' }}>
              <Doughnut 
                data={{
                  labels: ['Hostels', 'Academic', 'Facilities'],
                  datasets: [{
                    data: [45, 35, 20],
                    backgroundColor: ['rgba(6, 182, 212, 0.8)', 'rgba(99, 102, 241, 0.8)', 'rgba(244, 63, 94, 0.8)'],
                    borderWidth: 0
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false }, tooltip: { enabled: true } },
                  cutout: '70%'
                }}
              />
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6, margin: 0 }}>
              A live doughnut chart dividing power usage between Boys Hostels, Girls Hostels, and Academic Blocks. Enables you to visualize how residential grid loads stack up against operational blocks.
            </p>
          </div>

          {/* Grid Load vs Solar Card */}
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.2rem', borderRadius: '8px', border: '1px solid var(--panel-border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h4 style={{ margin: '0', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-emerald)' }}></span>
              Grid Load vs Solar Generation
            </h4>
            
            {/* Mini Line Chart */}
            <div style={{ height: '80px' }}>
              <Line 
                data={{
                  labels: ['00', '04', '08', '12', '16', '20'],
                  datasets: [
                    {
                      label: 'Grid',
                      data: [500, 480, 800, 1100, 950, 700],
                      borderColor: 'rgba(99, 102, 241, 0.8)',
                      borderWidth: 1.5,
                      fill: false,
                      pointRadius: 0
                    },
                    {
                      label: 'Solar',
                      data: [0, 0, 150, 350, 200, 0],
                      borderColor: 'rgba(16, 185, 129, 0.8)',
                      borderWidth: 1.5,
                      fill: false,
                      pointRadius: 0
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: { x: { display: false }, y: { display: false } }
                }}
              />
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6, margin: 0 }}>
              An area chart displaying total electricity consumption matched against solar generation, showing temperature correlations on a dual Y-axis. Highlights exactly how solar offsets total consumption.
            </p>
          </div>

          {/* Secondary Drivers Card */}
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.2rem', borderRadius: '8px', border: '1px solid var(--panel-border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h4 style={{ margin: '0', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-rose)' }}></span>
              Secondary Drivers Chart
            </h4>
            
            {/* Mini Bar Chart */}
            <div style={{ height: '80px' }}>
              <Bar 
                data={{
                  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
                  datasets: [
                    {
                      label: 'Occupancy',
                      data: [1200, 1400, 1350, 1500, 900],
                      backgroundColor: 'rgba(244, 63, 94, 0.7)',
                      borderRadius: 2
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: { x: { display: false }, y: { display: false } }
                }}
              />
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6, margin: 0 }}>
              Charts environmental factors (humidity, temperatures) alongside specific hostel building loads. Helps explain *why* consumption spikes (e.g. humidity index driving residential AC usage).
            </p>
          </div>

        </div>
      </section>

    </div>
  );
}

export default Documentation;
