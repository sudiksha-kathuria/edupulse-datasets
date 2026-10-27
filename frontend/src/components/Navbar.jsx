import { useEffect, useState } from 'react';
import './Navbar.css';

const NAV = [
  { id: 'hero',      label: 'Home' },
  { id: 'predictor', label: 'Predictor' },
  { id: 'datasets',  label: 'Datasets' },
  { id: 'models',    label: 'Models' },
];

export default function Navbar() {
  const [active, setActive]   = useState('hero');
  const [solid,  setSolid]    = useState(false);
  const [open,   setOpen]     = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const obs = [];
    NAV.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const o = new IntersectionObserver(
        ([e]) => { if (e.isIntersecting) setActive(id); },
        { rootMargin: '-38% 0px -58% 0px' }
      );
      o.observe(el);
      obs.push(o);
    });
    return () => obs.forEach(o => o.disconnect());
  }, []);

  const go = id => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setOpen(false);
  };

  return (
    <nav className={`nav${solid ? ' solid' : ''}${open ? ' menu-open' : ''}`}>
      <div className="nav-wrap container">
        <button className="logo" onClick={() => go('hero')}>
          Edu<span>Pulse</span>
        </button>

        <ul className={`links${open ? ' open' : ''}`}>
          {NAV.map(({ id, label }) => (
            <li key={id}>
              <button className={active === id ? 'on' : ''} onClick={() => go(id)}>
                {label}
                {active === id && <span className="dot" />}
              </button>
            </li>
          ))}
        </ul>

        <button className={`burger${open ? ' x' : ''}`} onClick={() => setOpen(v => !v)} aria-label="menu">
          <span /><span /><span />
        </button>
      </div>
    </nav>
  );
}
