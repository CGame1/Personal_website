import React, { useEffect, useState } from 'react';
import './Publications.css';

const Publications = () => {
    const [publications, setPublications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch from the public data folder
        fetch('./data/publications.json')
            .then(res => res.json())
            .then(data => {
                setPublications(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load publications", err);
                setLoading(false);
            });
    }, []);

    return (
        <div className="publications-section">
            <h2>Publications</h2>
            {loading && <p>Loading publications...</p>}

            {!loading && publications.length === 0 && (
                <p>No publications found or data not yet generated.</p>
            )}

            <div className="publications-list">
                {publications.map((pub, index) => (
                    <div key={index} className="publication-item">
                        <h3 className="pub-title">
                            {pub.url ? <a href={pub.url} target="_blank" rel="noopener noreferrer">{pub.title}</a> : pub.title}
                        </h3>
                        <p className="pub-authors">{pub.authors}</p>
                        <p className="pub-venue">
                            <span className="venue-name">{pub.venue}</span>
                            {pub.year && <span className="pub-year"> ({pub.year})</span>}
                        </p>
                        <div className="pub-links">
                            {pub.citation_url && <a href={pub.citation_url} target="_blank" rel="noopener noreferrer">Citations</a>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Publications;
