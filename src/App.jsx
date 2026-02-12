import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './components/Home';
import Research from './components/Research';
import Publications from './components/Publications';
import Roles from './components/Roles';
import Contact from './components/Contact';
import './App.css';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="research" element={<Research />} />
                    <Route path="publications" element={<Publications />} />
                    <Route path="roles" element={<Roles />} />
                    <Route path="contact" element={<Contact />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
