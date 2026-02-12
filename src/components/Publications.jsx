import React, { useEffect, useState } from 'react';
import './Publications.css';

const Publications = () => {
    const [publications, setPublications] = useState([
        {
            "title": "Deep Blueprint: A Literature Review and Guide to Automated Image Classification for Ecologists",
            "authors": "Chloe Amanda Game, Nils Piechaud, Kerry Howell",
            "year": 2025,
            "venue": "bioRxiv",
            "url": "https://www.biorxiv.org/content/10.1101/2025.11.03.686223.abstract",
            "citation_url": ""
        },
        {
            "title": "Report on the Marine Imaging Workshop 2022",
            "authors": "Catherine Borremans, Jennifer Durden, Timm Schoening, et al., Chloe Game, et al.",
            "year": 2024,
            "venue": "Research Ideas and Outcomes 10, e119782",
            "url": "https://riojournal.com/article/119782/download/pdf/",
            "citation_url": "https://scholar.google.com/scholar?cites=14744035472156776550"
        },
        {
            "title": "Machine learning for non-experts: A more accessible and simpler approach to automatic benthic habitat classification",
            "authors": "Chloe A Game, Michael B Thompson, Graham D Finlayson",
            "year": 2024,
            "venue": "Ecological Informatics, 102619",
            "url": "https://www.sciencedirect.com/science/article/pii/S1574954124001614",
            "citation_url": "https://scholar.google.com/scholar?cites=8274500049983750122"
        },
        {
            "title": "Weibull Tone Mapping (WTM) for the enhancement of underwater imagery",
            "authors": "Chloe Amanda Game, Michael Barry Thompson, Graham David Finlayson",
            "year": 2023,
            "venue": "Sensors 23 (7), 3533",
            "url": "https://www.mdpi.com/1424-8220/23/7/3533",
            "citation_url": "https://scholar.google.com/scholar?cites=754687883563807516"
        },
        {
            "title": "Domain-inspired image processing and computer vision to support deep-sea benthic ecology",
            "authors": "Chloe Game",
            "year": 2022,
            "venue": "University of East Anglia",
            "url": "https://ueaeprints.uea.ac.uk/id/eprint/93971/",
            "citation_url": ""
        },
        {
            "title": "Chromatic Weibull Tone Mapping for Underwater Image Enhancement",
            "authors": "Chloe A Game, Michael B Thompson, Graham D Finlayson",
            "year": 2021,
            "venue": "",
            "url": "https://ueaeprints.uea.ac.uk/id/eprint/81310/",
            "citation_url": "https://scholar.google.com/scholar?cites=15183699166626309455"
        },
        {
            "title": "Weibull Tone Mapping for Underwater Imagery",
            "authors": "Chloe A Game",
            "year": 2020,
            "venue": "Color and Imaging Conference 28, 156-161",
            "url": "https://library.imaging.org/cic/articles/28/1/art00025",
            "citation_url": "https://scholar.google.com/scholar?cites=9515754005679623064"
        },
        {
            "title": "A framework for the development of a global standardised marine taxon reference image database (SMarTaR-ID) to support image-based analyses",
            "authors": "Kerry L Howell, Jaime S Davies, ..., Chloe A Game, ...",
            "year": 2019,
            "venue": "PLoS One 14 (12), e0218904",
            "url": "https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0218904",
            "citation_url": "https://scholar.google.com/scholar?cites=16853158283041917410"
        },
        {
            "title": "The effect of deep oceanic flushing on water properties and ecosystem functioning within atolls in the British Indian Ocean Territory",
            "authors": "Emma V Sheehan, Phil Hosegood, Chloe A Game, et al.",
            "year": 2019,
            "venue": "Frontiers in Marine Science, 512",
            "url": "https://www.frontiersin.org/journals/marine-science/articles/10.3389/fmars.2019.00512/full",
            "citation_url": "https://scholar.google.com/scholar?cites=12193502485630280723"
        }
    ]);
    const [loading, setLoading] = useState(false);

    //     useEffect(() => {
    //         // Fetch from the public data folder
    //         fetch('./data/publications.json')
    //             .then(res => res.json())
    //             .then(data => {
    //                 setPublications(data);
    //                 setLoading(false);
    //             })
    //             .catch(err => {
    //                 console.error("Failed to load publications", err);
    //                 setLoading(false);
    //             });
    //     }, []);

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
