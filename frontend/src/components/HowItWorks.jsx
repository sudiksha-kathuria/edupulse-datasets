import { useEffect, useRef } from 'react';
import './HowItWorks.css';

const STEPS = [
  {
    num: '01',
    title: 'Collect signals',
    body: 'Attendance records, prior SGPA, daily study hours, social media use, and participation flags are pulled from data the institution already tracks.',
  },
  {
    num: '02',
    title: 'Score with ML',
    body: 'A trained Random Forest (or Logistic Regression / XGBoost) pipeline scores each student with a probability between 0 and 1, calibrated against historical probation outcomes.',
  },
  {
    num: '03',
    title: 'Act in time',
    body: 'Students above the intervention threshold are surfaced to advisors. The dashboard shows risk band, key drivers and peer-cohort comparison so action is targeted.',
  },
];

export default function HowItWorks() {
  const refs = useRef([]);

  useEffect(() => {
    refs.current.forEach((el, i) => {
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) el.classList.add('visible'); },
        { threshold: 0.2 }
      );
      obs.observe(el);
    });
  }, []);

  return (
    <section id="how-it-works" className="hiw section">
      <div className="container">
        <div className="section-label">How it works</div>
        <h2 className="section-title">Three steps to early intervention</h2>
        <p className="section-sub">
          From raw institutional data to an actionable risk flag in one lightweight pipeline.
        </p>
        <div className="hiw-steps">
          {STEPS.map((s, i) => (
            <div
              key={s.num}
              className="hiw-step fade-in"
              ref={el => refs.current[i] = el}
              style={{ transitionDelay: `${i * 0.1}s` }}
            >
              <div className="step-num">{s.num}</div>
              <div className="step-body">
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
