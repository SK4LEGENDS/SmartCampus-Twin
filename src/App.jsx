import React, { useState, useEffect } from 'react';
import { Zap, BookOpen, Calculator, Sun, Moon, AlertTriangle } from 'lucide-react';
import Dashboard from './components/Dashboard';
import Prediction from './components/Prediction';
import Documentation from './components/Documentation';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState('light');
  const [dataset, setDataset] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Theme setup
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    // Fetch dataset and stats from FastAPI
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch stats
        const statsRes = await fetch('/api/stats');
        if (!statsRes.ok) throw new Error('Failed to load global statistics');
        const statsData = await statsRes.json();
        setStats(statsData);

        // Fetch data rows
        const dataRes = await fetch('/api/data');
        if (!dataRes.ok) throw new Error('Failed to load dataset records');
        const dataRows = await dataRes.json();
        setDataset(dataRows);

      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <div className="container">
      {/* Header / Navigation */}
      <header>
        <div className="logo-section" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('dashboard')}>
          <h1>
            <Zap size={24} style={{ color: 'var(--accent-cyan)' }} />
            SmartCampus Twin
          </h1>
          <p>
            A simulated operational dataset generated based on real-world campus infrastructure, occupancy patterns, 
            laboratory usage, hostel energy demand, cafeteria usage, weather conditions, and solar energy generation.
          </p>
        </div>
        <div className="header-controls">
          <button 
            className={`btn ${activeTab === 'dashboard' ? '' : 'btn-secondary'}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={`btn ${activeTab === 'prediction' ? '' : 'btn-secondary'}`}
            onClick={() => setActiveTab('prediction')}
          >
            <Calculator size={16} /> Predict
          </button>
          <button 
            className={`btn ${activeTab === 'documentation' ? '' : 'btn-secondary'}`}
            onClick={() => setActiveTab('documentation')}
          >
            <BookOpen size={16} /> Docs
          </button>
          <button onClick={toggleTheme} className="theme-toggle-btn" title="Toggle Theme">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      {/* Loading and Error states */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem 0', gap: '1rem' }}>
          <div className="badge badge-blue" style={{ fontSize: '1.25rem', padding: '1rem 2rem' }}>
            Loading Campus Digital Twin...
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>Preparing models and loading dataset...</p>
        </div>
      ) : error ? (
        <div className="doc-section" style={{ borderColor: 'var(--accent-rose)', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <AlertTriangle size={32} style={{ color: 'var(--accent-rose)', flexShrink: 0 }} />
          <div>
            <h3 style={{ color: 'var(--accent-rose)', marginTop: 0 }}>Connection Error</h3>
            <p>{error}</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Ensure your Python backend server is running on <code>http://localhost:5000</code>.
            </p>
          </div>
        </div>
      ) : (
        <main>
          {activeTab === 'dashboard' && <Dashboard dataset={dataset} stats={stats} theme={theme} />}
          {activeTab === 'prediction' && <Prediction />}
          {activeTab === 'documentation' && <Documentation />}
        </main>
      )}

      {/* Footer */}
      <footer>
        <p>© 2026 Smart Campus Digital Twin Project. Simulated operational dataset for ML predictor validation.</p>
        <p style={{ marginTop: '0.75rem' }}>
          <button 
            className="badge badge-blue" 
            style={{ border: 'none', cursor: 'pointer', padding: '0.5rem 1rem', borderRadius: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            onClick={() => setActiveTab('documentation')}
          >
            <BookOpen size={14} /> System Documentation
          </button>
        </p>
      </footer>
    </div>
  );
}

export default App;
