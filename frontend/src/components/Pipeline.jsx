import { useEffect, useRef } from 'react';
import './Pipeline.css';

const MODELS = [
  {
    key: 'RF',
    name: 'Random Forest',
    params: '400 estimators · min 5 samples per leaf · class-weight balanced',
    note: 'Default model. Captures non-linear feature interactions and provides global feature importances.',
  },
  {
    key: 'LR',
    name: 'Logistic Regression',
    params: 'L2 regularisation · 1000 max iterations · class-weight balanced',
    note: 'Fast, interpretable baseline. Useful for understanding individual feature contributions via coefficients.',
  },
  {
    key: 'XGB',
    name: 'XGBoost',
    params: '300 estimators · max depth 4 · learning rate 0.05 · scale_pos_weight 3',
    note: 'Gradient-boosted trees. Strong on interaction effects; requires the xgboost package.',
  },
];

const NUM = [
  'Attendance %','Previous SGPA','Study Hours / Day','Study Sessions / Day',
  'Social Media Hours / Day','Skill Dev Hours / Day','Credits Completed','Age','Current Semester',
];
const CAT = [
  'Gender','Scholarship','University Transport','Learning Mode','Teacher Consultancy','Co-Curricular',
];

export default function Pipeline() {
  const refs = useRef([]);

  useEffect(() => {
    refs.current.forEach(el => {
      if (!el) return;
      const o = new IntersectionObserver(
        ([e]) => { if (e.isIntersecting) el.classList.add('in'); },
        { threshold: 0.08 }
      );
      o.observe(el);
    });
  }, []);

  return (
    <section id="models" className="pl-sec section">
      <div className="container">
        <div className="eyebrow">Models</div>
        <h2 className="sec-h">Three trained classifiers</h2>
        <p className="sec-p">
          Each model is serialised as a scikit-learn Pipeline that combines preprocessing and
          classification into one artifact.
        </p>

        <div className="pl-models">
          {MODELS.map((m, i) => (
            <div
              key={m.key}
              className={`pl-model card reveal d${i+1}`}
              ref={el => refs.current[i] = el}
            >
              <div className="pm-key">{m.key}</div>
              <div className="pm-name">{m.name}</div>
              <div className="pm-params">{m.params}</div>
              <p className="pm-note">{m.note}</p>
            </div>
          ))}
        </div>

        <div
          className="pl-feats card reveal"
          ref={el => refs.current[3] = el}
        >
          <div className="pf-col">
            <div className="pf-head">
              <span className="pf-label">Numeric features</span>
              <span className="pf-sub">StandardScaler</span>
            </div>
            <div className="pf-chips">
              {NUM.map(f => <span key={f} className="chip chip-num">{f}</span>)}
            </div>
          </div>
          <div className="pf-div" />
          <div className="pf-col">
            <div className="pf-head">
              <span className="pf-label">Categorical features</span>
              <span className="pf-sub">OneHotEncoder, drop first</span>
            </div>
            <div className="pf-chips">
              {CAT.map(f => <span key={f} className="chip chip-cat">{f}</span>)}
            </div>
          </div>
          <div className="pf-div" />
          <div className="pf-col">
            <div className="pf-head">
              <span className="pf-label">Target variable</span>
            </div>
            <code className="target-name">at_risk</code>
            <p className="target-desc">
              Binary flag derived from probation history.
              1 = student went on academic probation. Class-weight balancing
              applied across all models.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
