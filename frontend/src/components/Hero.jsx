import './Hero.css';

const BAND_COLOR  = { HIGH: '#f72585', MED: '#888', LOW: '#4a4a4a' };
const BAND_BG     = { HIGH: 'rgba(247,37,133,0.1)', MED: 'rgba(136,136,136,0.08)', LOW: 'rgba(74,74,74,0.1)' };
const BAND_BORDER = { HIGH: 'rgba(247,37,133,0.25)', MED: 'rgba(136,136,136,0.18)', LOW: 'rgba(74,74,74,0.2)' };
const BAND_LABEL  = { HIGH: 'High', MED: 'Medium', LOW: 'Low' };

export default function Hero({ students = [] }) {
  const go = id => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  const high = students.filter(s => s.band === 'HIGH').length;
  const med  = students.filter(s => s.band === 'MED').length;
  const low  = students.filter(s => s.band === 'LOW').length;

  return (
    <section id="hero" className="hero">
      <div className="container">
        <div className="hero-inner">

        <div className="h-text h-anim-1">
          <div className="h-pill">Academic Risk Intelligence</div>
          <h1 className="h-title">
            Know who needs help<br />before they fall behind.
          </h1>
          <p className="h-sub">
            EduPulse combines attendance, prior academic performance, and study
            behaviour into a single risk score so advisors can act before students
            reach probation.
          </p>
          <div className="h-ctas">
            <button className="btn btn-primary" onClick={() => go('predictor')}>
              Try the Predictor
            </button>
            <button className="btn btn-outline" onClick={() => go('datasets')}>
              Explore Datasets
            </button>
          </div>
          <div className="h-meta">
            <span>1,194 training records</span>
            <span className="h-dot" />
            <span>3 ML models</span>
            <span className="h-dot" />
            <span>15 input features</span>
            <span className="h-dot" />
            <span>4 public datasets</span>
          </div>
        </div>

        <div className="h-preview h-anim-2">
          <div className="preview-chrome">
            <div className="chrome-dots">
              <span /><span /><span />
            </div>
            <span className="chrome-app">EduPulse</span>
            <span className="chrome-sep">/</span>
            <span className="chrome-page">Student Risk Overview</span>
          </div>

          {students.length === 0 ? (
            <div className="preview-empty">
              <p className="pe-title">No predictions yet</p>
              <p className="pe-hint">
                Score a student using the <button className="pe-link" onClick={() => go('predictor')}>Risk Predictor</button> below.
                Results will appear here.
              </p>
            </div>
          ) : (
            <div className="preview-body">
              <div className="preview-topbar">
                <span className="preview-heading">
                  {students.length} student{students.length !== 1 ? 's' : ''} scored
                </span>
                <div className="preview-summary">
                  {high > 0 && <span className="ps-badge" style={{ color: BAND_COLOR.HIGH, background: BAND_BG.HIGH, borderColor: BAND_BORDER.HIGH }}>{high} High risk</span>}
                  {med  > 0 && <span className="ps-badge" style={{ color: BAND_COLOR.MED,  background: BAND_BG.MED,  borderColor: BAND_BORDER.MED  }}>{med} Medium</span>}
                  {low  > 0 && <span className="ps-badge" style={{ color: '#666',          background: BAND_BG.LOW,  borderColor: BAND_BORDER.LOW  }}>{low} Low</span>}
                </div>
              </div>

              <table className="preview-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Attendance</th>
                    <th>SGPA</th>
                    <th>Model</th>
                    <th>Risk score</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, i) => (
                    <tr key={i}>
                      <td className="td-name">{s.name}</td>
                      <td className={s.att < 70 ? 'val-warn' : ''}>{s.att}%</td>
                      <td className={s.gpa < 2.0 ? 'val-warn' : ''}>{s.gpa}</td>
                      <td className="td-mono">{s.model}</td>
                      <td className="td-score">
                        <div className="score-row">
                          <div className="score-track">
                            <div className="score-fill" style={{ width: `${s.score}%`, background: BAND_COLOR[s.band] }} />
                          </div>
                          <span style={{ color: BAND_COLOR[s.band] }}>{s.score}%</span>
                        </div>
                      </td>
                      <td>
                        <span className="band-pill" style={{ color: BAND_COLOR[s.band], background: BAND_BG[s.band], borderColor: BAND_BORDER[s.band] }}>
                          {BAND_LABEL[s.band]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        </div>{/* hero-inner */}
      </div>
    </section>
  );
}
