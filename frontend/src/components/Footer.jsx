import './Footer.css';

const NAV = [
  { id:'hero',      label:'Home' },
  { id:'predictor', label:'Predictor' },
  { id:'datasets',  label:'Datasets' },
  { id:'models',    label:'Models' },
];

export default function Footer() {
  const go = id => document.getElementById(id)?.scrollIntoView({ behavior:'smooth' });

  return (
    <footer className="footer">
      <div className="ft-top container">
        <div className="ft-brand">
          <div className="ft-logo">Edu<span>Pulse</span></div>
          <p className="ft-tag">Early-warning academic risk intelligence.</p>
        </div>
        <div className="ft-nav">
          <div className="ft-nt">Pages</div>
          <ul>
            {NAV.map(({ id, label }) => (
              <li key={id}><button onClick={() => go(id)}>{label}</button></li>
            ))}
          </ul>
        </div>
        <div className="ft-stack">
          <div className="ft-nt">Built with</div>
          <ul>
            {['scikit-learn','XGBoost','FastAPI','React + Vite'].map(s => (
              <li key={s}><span>{s}</span></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="ft-bottom container">
        <span>EduPulse</span>
        <span>Datasets sourced from Kaggle under open licenses.</span>
      </div>
    </footer>
  );
}
