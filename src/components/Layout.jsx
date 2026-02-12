import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import './Layout.css';

const Layout = () => {
    return (
        <div className="layout">
            <header className="header">
                <div className="logo">
                    <Link to="/">Academic Profile</Link>
                </div>
                <nav className="nav">
                    <Link to="/">Home</Link>
                    <Link to="/research">Research</Link>
                    <Link to="/publications">Publications</Link>
                    <Link to="/roles">Roles</Link>
                    <Link to="/contact">Contact</Link>
                </nav>
            </header>
            <main className="content">
                <Outlet />
            </main>
            <footer className="footer">
                <p>&copy; {new Date().getFullYear()} Academic Profile. Built with React & Vite.</p>
            </footer>
        </div>
    );
};

export default Layout;
