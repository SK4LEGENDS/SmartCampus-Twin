import React, { useState } from 'react';
import { Calculator, Play, AlertTriangle, Users, Home, Laptop, Sun, Activity } from 'lucide-react';

function Prediction() {
  const [formData, setFormData] = useState({
    Temperature_C: 30.0,
    Humidity_Percent: 50,
    AB1_Students: 100,
    AB2_Students: 80,
    AB3_Students: 0,
    AB4_Students: 0,
    AB5_Students: 0,
    MAB1_Students: 50,
    MAB2_Students: 0,
    MAB3_Students: 0,
    MAB4_Students: 0,
    Active_Windows_Labs: 4,
    Active_Mac_Labs: 2,
    Central_Library_Occupancy: 120,
    Admin_Office_Staff: 25,
    Glass_Cafeteria_Occupancy: 45,
    Open_Cafeteria_Occupancy: 30,
    Auditorium_Active: 0,
    Boys_Hostel_Load_kWh: 350,
    Girls_Hostel_Load_kWh: 320,
    Solar_Generation_kWh: 150,
    Date: new Date().toISOString().slice(0, 10),
    Time: '12:00',
    Day: 'Monday'
  });

  const [prediction, setPrediction] = useState(null);
  const [anomalyPrediction, setAnomalyPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    let val = value;
    if (type === 'number') {
      val = value === '' ? '' : Number(value);
    }
    setFormData(prev => ({
      ...prev,
      [name]: val
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPrediction(null);
    setAnomalyPrediction(null);
    try {
      // 1. Fetch grid load prediction
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Prediction failed');
      }
      const data = await response.json();
      setPrediction(data.prediction);

      // 2. Fetch anomaly classification prediction
      const anomalyResponse = await fetch('/api/predict_anomaly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (anomalyResponse.ok) {
        const anomalyData = await anomalyResponse.json();
        setAnomalyPrediction(anomalyData.is_anomaly);
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Derive active inputs totals in real-time
  const totalStudents = formData.AB1_Students + formData.AB2_Students + formData.AB3_Students +
                        formData.AB4_Students + formData.AB5_Students + formData.MAB1_Students +
                        formData.MAB2_Students + formData.MAB3_Students + formData.MAB4_Students;

  const totalHostelLoad = formData.Boys_Hostel_Load_kWh + formData.Girls_Hostel_Load_kWh;
  const totalLabs = formData.Active_Windows_Labs + formData.Active_Mac_Labs;

  // Determine load status color and labels
  const getLoadStatus = (val) => {
    if (val < 1800) return { label: 'Low Demand', color: 'var(--accent-emerald)', pct: Math.min(100, (val / 1800) * 100) };
    if (val < 3200) return { label: 'Moderate Demand', color: 'var(--accent-cyan)', pct: Math.min(100, ((val - 1800) / 1400) * 100) };
    return { label: 'Peak Demand', color: 'var(--accent-rose)', pct: Math.min(100, ((val - 3200) / 1800) * 100) };
  };

  const loadStatus = prediction !== null ? getLoadStatus(prediction) : null;

  return (
    <div className="fade-in-up">
      <div className="prediction-grid" style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
        
        {/* Form Inputs (Left side, takes more space) */}
        <form onSubmit={handleSubmit} style={{ flex: '2', display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
          

          {/* 1. Weather & Time */}
          <div className="form-card" style={{ padding: '1.25rem' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem', borderBottom: '1px solid var(--panel-border)', paddingBottom: '0.25rem', fontSize: '0.9rem', color: 'var(--accent-indigo)' }}>
              Weather & Time Context
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
              <div className="form-group">
                <label>Temp (°C)</label>
                <input type="number" name="Temperature_C" value={formData.Temperature_C} onChange={handleChange} className="form-input" required />
              </div>
              <div className="form-group">
                <label>Humidity (%)</label>
                <input type="number" name="Humidity_Percent" value={formData.Humidity_Percent} onChange={handleChange} className="form-input" required />
              </div>
              <div className="form-group">
                <label>Date</label>
                <input type="date" name="Date" value={formData.Date} onChange={handleChange} className="form-input" required />
              </div>
              <div className="form-group">
                <label>Time</label>
                <input type="time" name="Time" value={formData.Time} onChange={handleChange} className="form-input" required />
              </div>
              <div className="form-group">
                <label>Day of Week</label>
                <select name="Day" value={formData.Day} onChange={handleChange} className="chart-select" style={{ width: '100%', padding: '0.45rem 2rem 0.45rem 0.8rem' }} required>
                  <option value="Monday">Monday</option>
                  <option value="Tuesday">Tuesday</option>
                  <option value="Wednesday">Wednesday</option>
                  <option value="Thursday">Thursday</option>
                  <option value="Friday">Friday</option>
                  <option value="Saturday">Saturday</option>
                  <option value="Sunday">Sunday</option>
                </select>
              </div>
            </div>
          </div>

          {/* 2. Academic Block Students */}
          <div className="form-card" style={{ padding: '1.25rem' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem', borderBottom: '1px solid var(--panel-border)', paddingBottom: '0.25rem', fontSize: '0.9rem', color: 'var(--accent-cyan)' }}>
              Academic Building Occupancy
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem' }}>
              {['AB1', 'AB2', 'AB3', 'AB4', 'AB5'].map(ab => (
                <div className="form-group" key={ab}>
                  <label>{ab} Students</label>
                  <input type="number" name={`${ab}_Students`} value={formData[`${ab}_Students`]} onChange={handleChange} className="form-input" required />
                </div>
              ))}
            </div>
          </div>

          {/* 3. M-Block Students */}
          <div className="form-card" style={{ padding: '1.25rem' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem', borderBottom: '1px solid var(--panel-border)', paddingBottom: '0.25rem', fontSize: '0.9rem', color: 'var(--accent-violet)' }}>
              M-Block Building Occupancy
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem' }}>
              {['MAB1', 'MAB2', 'MAB3', 'MAB4'].map(mab => (
                <div className="form-group" key={mab}>
                  <label>{mab} Students</label>
                  <input type="number" name={`${mab}_Students`} value={formData[`${mab}_Students`]} onChange={handleChange} className="form-input" required />
                </div>
              ))}
            </div>
          </div>

          {/* 4. Labs & Library */}
          <div className="form-card" style={{ padding: '1.25rem' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem', borderBottom: '1px solid var(--panel-border)', paddingBottom: '0.25rem', fontSize: '0.9rem', color: 'var(--accent-emerald)' }}>
              Laboratory & Library Occupancy
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
              <div className="form-group">
                <label>Windows Labs</label>
                <input type="number" name="Active_Windows_Labs" value={formData.Active_Windows_Labs} onChange={handleChange} className="form-input" required />
              </div>
              <div className="form-group">
                <label>Mac Labs</label>
                <input type="number" name="Active_Mac_Labs" value={formData.Active_Mac_Labs} onChange={handleChange} className="form-input" required />
              </div>
              <div className="form-group">
                <label>Library Occupancy</label>
                <input type="number" name="Central_Library_Occupancy" value={formData.Central_Library_Occupancy} onChange={handleChange} className="form-input" required />
              </div>
              <div className="form-group">
                <label>Admin Office Staff</label>
                <input type="number" name="Admin_Office_Staff" value={formData.Admin_Office_Staff} onChange={handleChange} className="form-input" required />
              </div>
            </div>
          </div>

          {/* 5. Cafeteria & Events */}
          <div className="form-card" style={{ padding: '1.25rem' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem', borderBottom: '1px solid var(--panel-border)', paddingBottom: '0.25rem', fontSize: '0.9rem', color: 'var(--accent-rose)' }}>
              Cafeteria & Auditorium Status
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
              <div className="form-group">
                <label>Glass Cafeteria</label>
                <input type="number" name="Glass_Cafeteria_Occupancy" value={formData.Glass_Cafeteria_Occupancy} onChange={handleChange} className="form-input" required />
              </div>
              <div className="form-group">
                <label>Open Cafeteria</label>
                <input type="number" name="Open_Cafeteria_Occupancy" value={formData.Open_Cafeteria_Occupancy} onChange={handleChange} className="form-input" required />
              </div>
              <div className="form-group">
                <label>Auditorium Active</label>
                <select name="Auditorium_Active" value={formData.Auditorium_Active} onChange={handleChange} className="chart-select" style={{ width: '100%', padding: '0.45rem 2rem 0.45rem 0.8rem' }} required>
                  <option value={0}>Inactive (0)</option>
                  <option value={1}>Active (1)</option>
                </select>
              </div>
            </div>
          </div>

          {/* 6. Hostels & Generation */}
          <div className="form-card" style={{ padding: '1.25rem' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem', borderBottom: '1px solid var(--panel-border)', paddingBottom: '0.25rem', fontSize: '0.9rem', color: 'var(--accent-indigo)' }}>
              Hostel Demand & Solar Offset
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
              <div className="form-group">
                <label>Boys Hostel (kWh)</label>
                <input type="number" name="Boys_Hostel_Load_kWh" value={formData.Boys_Hostel_Load_kWh} onChange={handleChange} className="form-input" required />
              </div>
              <div className="form-group">
                <label>Girls Hostel (kWh)</label>
                <input type="number" name="Girls_Hostel_Load_kWh" value={formData.Girls_Hostel_Load_kWh} onChange={handleChange} className="form-input" required />
              </div>
              <div className="form-group">
                <label>Solar Gen (kWh)</label>
                <input type="number" name="Solar_Generation_kWh" value={formData.Solar_Generation_kWh} onChange={handleChange} className="form-input" required />
              </div>
            </div>
          </div>

          <button type="submit" className="btn pulse-highlight" style={{ padding: '1rem', justifyContent: 'center', fontSize: '1rem', fontWeight: 600 }} disabled={loading}>
            {loading ? 'Processing Model Inference...' : (
              <>
                <Play size={18} /> Run Predictor Engine
              </>
            )}
          </button>
        </form>

        {/* Prediction Results Panel (Right side, sticky & balanced) */}
        <div style={{ flex: '1', position: 'sticky', top: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%', alignSelf: 'flex-start' }}>
          
          {/* Main Results gauge */}
          <div className="result-card" style={{ minHeight: '280px', padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
              Live Electricity Forecast
            </h3>

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '2.5rem', gap: '1rem' }}>
                <div className="badge badge-blue">Computing Features...</div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Querying FastAPI model...</p>
              </div>
            ) : prediction !== null ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '1.5rem', width: '100%' }}>
                <div className="result-value-display" style={{ margin: 0, fontSize: '3.25rem', fontWeight: 900, color: 'var(--accent-indigo)' }}>
                  {prediction.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginTop: '0.25rem' }}>
                  Predicted Load (kWh)
                </div>

                {/* Status Bar */}
                <div style={{ width: '100%', marginTop: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.35rem' }}>
                    <span style={{ fontWeight: 600, color: loadStatus.color }}>{loadStatus.label}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{prediction.toFixed(1)} kWh</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'var(--panel-border)', borderRadius: '3px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${loadStatus.pct}%`, background: loadStatus.color, borderRadius: '3px', transition: 'width 0.6s ease' }} />
                  </div>
                </div>

                {/* Anomaly Detection Status (Supervised Logistic Regression Classifier output) */}
                <div style={{ width: '100%', marginTop: '1.5rem', padding: '0.75rem', borderRadius: '8px', border: '1px solid', borderColor: anomalyPrediction === 1 ? 'rgba(244, 63, 94, 0.3)' : 'rgba(16, 185, 129, 0.3)', background: anomalyPrediction === 1 ? 'rgba(244, 63, 94, 0.04)' : 'rgba(16, 185, 129, 0.04)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Activity size={16} style={{ color: anomalyPrediction === 1 ? 'var(--accent-rose)' : 'var(--accent-emerald)', flexShrink: 0 }} />
                  <div style={{ textAlign: 'left' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', display: 'block', color: anomalyPrediction === 1 ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>
                      {anomalyPrediction === 1 ? 'Anomaly Flagged!' : 'Operational Profile: Normal'}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                      {anomalyPrediction === 1 ? 'Logistic Regression classifier flags this input pattern as an operational outlier.' : 'Logistic Regression classifier reports no systemic energy leakage.'}
                    </span>
                  </div>
                </div>
                
                <span className="badge badge-blue" style={{ marginTop: '2rem', fontSize: '0.75rem' }}>
                  Linear Regression Model
                </span>
              </div>
            ) : error ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--accent-rose)', alignItems: 'center', marginTop: '2rem', textAlign: 'center' }}>
                <AlertTriangle size={28} />
                <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{error}</span>
              </div>
            ) : (
              <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '0.85rem' }}>
                  Configure variables on the left and click execute to query the predictive machine learning models.
                </p>
              </div>
            )}
          </div>

          {/* Derived Features Insight Card */}
          <div className="form-card" style={{ padding: '1.25rem' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1.25rem', borderBottom: '1px solid var(--panel-border)', paddingBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Real-time Feature Engineering
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justify: 'between', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexGrow: 1 }}>
                  <Users size={16} style={{ color: 'var(--accent-cyan)' }} />
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Total Students Occupancy</span>
                </div>
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{totalStudents}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justify: 'between', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexGrow: 1 }}>
                  <Home size={16} style={{ color: 'var(--accent-rose)' }} />
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Total Hostel Energy Demand</span>
                </div>
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{totalHostelLoad} kWh</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justify: 'between', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexGrow: 1 }}>
                  <Laptop size={16} style={{ color: 'var(--accent-emerald)' }} />
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Active Computer Labs</span>
                </div>
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{totalLabs}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justify: 'between', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexGrow: 1 }}>
                  <Sun size={16} style={{ color: 'var(--accent-cyan)' }} />
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Renewable Solar Output</span>
                </div>
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{formData.Solar_Generation_kWh} kWh</span>
              </div>
            </div>
            
            {prediction !== null && prediction > 0 && (
              <div style={{ marginTop: '1.25rem', padding: '0.75rem', background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.15)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={14} style={{ color: 'var(--accent-emerald)' }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Solar offsets <strong>{((formData.Solar_Generation_kWh / prediction) * 100).toFixed(2)}%</strong> of the predicted demand load.
                </span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default Prediction;
