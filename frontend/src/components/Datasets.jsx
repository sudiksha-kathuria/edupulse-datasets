import { useEffect, useRef } from 'react';
import './Datasets.css';

const DATA = [
  {
    name: 'CSE Academic Performance',
    file: 'student_academic_performance_cse.csv',
    rows: '1,194',
    tags: ['Primary', 'Modelling'],
    license: 'CC BY-NC-SA 4.0',
    desc: 'Computer Science and Engineering students with attendance, SGPA, study habits, social media use, and probation history. Primary dataset for model training.',
    accent: '#f72585',
  },
  {
    name: 'Engineering Student Journey',
    file: 'engineering_student_journey.csv',
    rows: '2,000',
    tags: ['GPA Trajectory', 'Placement'],
    license: 'CC0',
    desc: 'Six engineering branches with semester-wise GPA across 8 semesters, attendance, backlogs, internship history, and placement outcomes.',
    accent: '#7b2fff',
  },
  {
    name: 'Tamil Nadu Student Performance',
    file: 'student_performance_tamilnadu.csv',
    rows: '5,000',
    tags: ['Multi-campus', 'GPA'],
    license: 'MIT',
    desc: 'Students across Tamil Nadu campuses with GPA, subject scores, and aptitude results. Used for cross-institution comparison.',
    accent: '#f7931e',
  },
  {
    name: 'School Performance and Attendance',
    file: 'student_performance_attendance.csv',
    rows: '25,000',
    tags: ['Large-scale', 'Clustering'],
    license: 'CC BY 4.0',
    desc: 'Twenty-five thousand school-level records with attendance percentage, subject scores, and final grade. Used in K-means segmentation.',
    accent: '#06d6a0',
  },
];

export default function Datasets() {
  const refs = useRef([]);

  useEffect(() => {
    refs.current.forEach(el => {
      if (!el) return;
      const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) el.classList.add('in'); }, { threshold: 0.1 });
      o.observe(el);
    });
  }, []);

  return (
    <section id="datasets" className="ds-sec section">
      <div className="container">
        <div className="eyebrow">Datasets</div>
        <h2 className="sec-h">Four public datasets</h2>
        <p className="sec-p">Sourced from Kaggle under open licenses. Used for experimentation and model training only.</p>

        <div className="ds-grid">
          {DATA.map((d, i) => (
            <div
              key={d.file}
              className={`ds-card card reveal d${i + 1}`}
              ref={el => refs.current[i] = el}
              style={{ '--a': d.accent }}
            >
              <div className="ds-top-bar" style={{ background: d.accent }} />
              <div className="ds-body">
                <div className="ds-head">
                  <h3 className="ds-name">{d.name}</h3>
                  <span className="ds-rows" style={{ color: d.accent, background: `${d.accent}18`, border: `1px solid ${d.accent}30` }}>
                    {d.rows}
                  </span>
                </div>
                <p className="ds-desc">{d.desc}</p>
                <div className="ds-foot">
                  <div className="ds-tags">
                    {d.tags.map(t => <span key={t} className="ds-tag">{t}</span>)}
                  </div>
                  <span className="ds-lic">{d.license}</span>
                </div>
                <div className="ds-file">{d.file}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
