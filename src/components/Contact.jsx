import React from 'react';
import { Mail, Github, BookOpen } from 'lucide-react';

const Contact = () => {
    return (
        <div className="contact-section">
            <h2>Contact</h2>
            <div className="contact-links">
                <p>
                    <Mail className="icon" size={18} />
                    <a href="mailto:email@example.com">email@example.com</a>
                </p>
                <p>
                    <Github className="icon" size={18} />
                    <a href="https://github.com/username">GitHub Profile</a>
                </p>
                <p>
                    <BookOpen className="icon" size={18} />
                    <a href="https://scholar.google.com/">Google Scholar</a>
                </p>
            </div>
        </div>
    );
};

export default Contact;
