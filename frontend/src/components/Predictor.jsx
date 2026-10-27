import { useEffect, useRef, useState } from 'react';
import './Predictor.css';

const API = 'http://localhost:8000';

const DEFAULTS = {
  name: '',
  attendance_pct: 85,
  previous_sgpa: 2.5,
  study_hours_daily: 3,
  social_media_hours: 3,
  skill_dev_hours: 2,
  study_sessions_daily: 2,
  credits_completed: 60,
  age: 21,
  current_semester: 5,
  gender: 'Male',
  has_scholarship: 'No',
  uses_transport: 'No',
  learning_mode: 'Offline',
  uses_teacher_consultancy: 'No',
  co_curricular: 'No',
  model: 'rf',
};

const SLIDERS = [
  { key:'attendance_pct',       label:'Attendance',           unit:'%', min:0,  max:100, step:1   },
  { key:'previous_sgpa',        label:'Previous SGPA',        unit:'',  min:0,  max:4,   step:0.1 },
  { key:'study_hours_daily',    label:'Study Hours / Day',    unit:'h', min:0,  max:12,  step:0.5 },
  { key:'social_media_hours',   label:'Social Media / Day',   unit:'h', min:0,  max:12,  step:0.5 },
  { key:'skill_dev_hours',      label:'Skill Dev / Day',      unit:'h', min:0,  max:8,   step:0.5 },
  { key:'study_sessions_daily', label:'Study Sessions / Day', unit:'',  min:1,  max:6,   step:1   },
  { key:'credits_completed',    label:'Credits Completed',    unit:'',  min:0,  max:150, step:1   },
  { key:'age',                  label:'Age',                  unit:'',  min:18, max:30,  step:1   },
  { key:'current_semester',     label:'Semester',             unit:'',  min:1,  max:12,  step:1   },
];

const SELECTS = [
  { key:'gender',                   label:'Gender',               opts:[['Male','Male'],['Female','Female']] },
  { key:'has_scholarship',          label:'Scholarship',          opts:[['No','No'],['Yes','Yes']] },
  { key:'uses_transport',           label:'University Transport', opts:[['No','No'],['Yes','Yes']] },
  { key:'learning_mode',            label:'Learning Mode',        opts:[['Offline','Offline'],['Online','Online'],['Hybrid','Hybrid']] },
  { key:'uses_teacher_consultancy', label:'Teacher Consultancy',  opts:[['No','No'],['Yes','Yes']] },
  { key:'co_curricular',            label:'Co-Curricular',        opts:[['No','No'],['Yes','Yes']] },
  { key:'model',                    label:'Model',                opts:[['rf','Random Forest'],['lr','Logistic Regression']] },
];

const BANDS = {
  HIGH:   { color:'#f72585', label:'High Risk',   tip:'Early intervention is recommended.' },
  MEDIUM: { color:'#888888', label:'Medium Risk',  tip:'Monitor closely over the next few weeks.' },
  LOW:    { color:'#cccccc', label:'Low Risk',     tip:'Student is on track.' },
};

function localPredict(form) {
  let s = 0.44;
  const att = form.attendance_pct;
  s += att <= 60 ? 0.27 : att <= 70 ? 0.17 : att <= 80 ? 0.06 : att <= 90 ? -0.04 : -0.12;
  const gpa = form.previous_sgpa;
  s += gpa < 1.5 ? 0.22 : gpa < 2.0 ? 0.13 : gpa < 2.5 ? 0.05 : gpa < 3.0 ? -0.03 : -0.12;
  s -= (form.study_hours_daily * 0.02 + form.study_sessions_daily * 0.014 + form.skill_dev_hours * 0.014);
  s += form.social_media_hours * 0.017;
  if (form.has_scholarship === 'Yes') s -= 0.07;
  if (form.uses_teacher_consultancy === 'Yes') s += 0.04;
  if (form.credits_completed > 90) s -= 0.04;
  else if (form.credits_completed < 30) s += 0.03;
  s = Math.max(0.03, Math.min(0.96, s));
  const threshold = 0.35;
  const band = s >= 0.60 ? 'HIGH' : s >= threshold ? 'MEDIUM' : 'LOW';
  return { risk_score: parseFloat(s.toFixed(4)), risk_band: band, at_risk: s >= threshold, threshold_used: threshold, local: true };
}

function RiskGauge({ score, color }) {
  const r = 50;
  const circ = 2 * Math.PI * r;
  return (
    <div className="gauge">
      <svg width="124" height="124" viewBox="0 0 124 124">
        <circle cx="62" cy="62" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5"/>
        <circle cx="62" cy="62" r={r} fill="none" stroke={color} strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - score)}
          transform="rotate(-90 62 62)"
          style={{ transition: 'stroke-dashoffset 0.8s var(--ease)' }}
        />
      </svg>
      <div className="gauge-inner">
        <span className="gauge-pct" style={{ color }}>{(score * 100).toFixed(0)}%</span>
        <span className="gauge-lbl">probability</span>
      </div>
    </div>
  );
}

export default function Predictor({ onAdd }) {
  const secRef  = useRef(null);
  const [form,    setForm]    = useState(DEFAULTS);
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const el = secRef.current;
    if (!el) return;
    const o = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) el.classList.add('in'); },
      { threshold: 0.04 }
    );
    o.observe(el);
    return () => o.disconnect();
  }, []);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const predict = async () => {
    setLoading(true);
    let res = null;
    try {
      const r = await fetch(`${API}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (r.ok) res = { ...(await r.json()), local: false };
    } catch {}
    if (!res) res = localPredict(form);
    setResult(res);
    setLoading(false);

    if (onAdd) {
      onAdd({
        name:  form.name.trim() || 'Anonymous',
        att:   form.attendance_pct,
        gpa:   form.previous_sgpa.toFixed(1),
        model: form.model === 'rf' ? 'RF' : 'LR',
        score: Math.round(res.risk_score * 100),
        band:  res.risk_band === 'MEDIUM' ? 'MED' : res.risk_band,
      });
    }
  };

  const band = result ? BANDS[result.risk_band] : null;

  return (
    <section id="predictor" className="pred-sec section">
      <div className="container">
        <div className="sec-header reveal" ref={secRef}>
          <div className="eyebrow">Risk Predictor</div>
          <h2 className="sec-h">Score a student profile</h2>
          <p className="sec-p">
            Fill in the student profile below and click Predict. The result appears instantly
            and is added to the overview on the home page.
          </p>
        </div>

        <div className="pred-layout">
          <div className="pred-form card">

            <div className="name-block">
              <label className="field-label">Student name <span>(optional)</span></label>
              <input
                className="text-input"
                type="text"
                placeholder="e.g. Priya Sharma"
                value={form.name}
                onChange={e => set('name', e.target.value)}
              />
            </div>

            <div className="divider" />

            <div className="fg">
              <div className="fg-title">Numeric inputs</div>
              <div className="sliders-grid">
                {SLIDERS.map(({ key, label, unit, min, max, step }) => (
                  <div className="sl-row" key={key}>
                    <div className="sl-meta">
                      <span className="sl-label">{label}</span>
                      <span className="sl-value">
                        {step < 1 ? Number(form[key]).toFixed(1) : form[key]}{unit}
                      </span>
                    </div>
                    <input
                      type="range" min={min} max={max} step={step} value={form[key]}
                      onChange={e => set(key, parseFloat(e.target.value))}
                      style={{ '--pct': `${((form[key] - min) / (max - min)) * 100}%` }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="divider" />

            <div className="fg">
              <div className="fg-title">Categorical inputs</div>
              <div className="sel-grid">
                {SELECTS.map(({ key, label, opts }) => (
                  <div className="sel-row" key={key}>
                    <label className="field-label">{label}</label>
                    <select value={form[key]} onChange={e => set(key, e.target.value)}>
                      {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            <button className="pred-btn btn btn-primary" onClick={predict} disabled={loading}>
              {loading ? <><span className="spin" /> Scoring...</> : 'Predict Risk'}
            </button>

          </div>

          <div className="pred-result">
            {!result ? (
              <div className="r-empty card">
                <div className="r-empty-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 7v5l3 3" strokeLinecap="round"/>
                  </svg>
                </div>
                <p>Results will appear here after you click <strong>Predict Risk</strong>.</p>
              </div>
            ) : (
              <div className="r-card card" key={result.risk_score}>
                <div className="r-top">
                  <span className="r-band"
                    style={{ color: band.color, borderColor: band.color + '40', background: band.color + '12' }}>
                    {band.label}
                  </span>
                  {result.local && <span className="r-local">local inference</span>}
                </div>

                <RiskGauge score={result.risk_score} color={band.color} />

                <p className="r-tip">{band.tip}</p>

                <div className="r-meta">
                  <div className="r-cell">
                    <span className="r-k">At risk</span>
                    <span className="r-v" style={{ color: result.at_risk ? 'var(--pink)' : 'var(--t2)' }}>
                      {result.at_risk ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="r-cell">
                    <span className="r-k">Threshold</span>
                    <span className="r-v">{(result.threshold_used * 100).toFixed(0)}%</span>
                  </div>
                  <div className="r-cell">
                    <span className="r-k">Band</span>
                    <span className="r-v">{result.risk_band}</span>
                  </div>
                  <div className="r-cell">
                    <span className="r-k">Model</span>
                    <span className="r-v">{form.model === 'rf' ? 'Random Forest' : 'Logistic Regression'}</span>
                  </div>
                </div>

                <div className="r-legend">
                  {Object.entries(BANDS).map(([k, b]) => (
                    <div className="rl-row" key={k}>
                      <span className="rl-dot" style={{ background: b.color }} />
                      <span className="rl-name">{b.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
