import { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Predictor from './components/Predictor';
import Datasets from './components/Datasets';
import Pipeline from './components/Pipeline';
import Footer from './components/Footer';

export default function App() {
  const [students, setStudents] = useState([]);

  const addStudent = (entry) => {
    setStudents(prev => [entry, ...prev].slice(0, 20));
  };

  return (
    <>
      <Navbar />
      <main>
        <Hero students={students} />
        <Predictor onAdd={addStudent} />
        <Datasets />
        <Pipeline />
      </main>
      <Footer />
    </>
  );
}
