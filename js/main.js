document.addEventListener('DOMContentLoaded', () => {
    fetchPublications();
});

async function fetchPublications() {
    const container = document.getElementById('publication-list');
    if (!container) return;

    try {
        const response = await fetch('data/publications.json');
        if (!response.ok) {
            throw new Error('Failed to load publications');
        }
        
        const publications = await response.json();
        renderPublications(publications, container);
    } catch (error) {
        console.error('Error fetching publications:', error);
        container.innerHTML = '<p>Unable to load publications at this time.</p>';
    }
}

function renderPublications(publications, container) {
    container.innerHTML = ''; // Clear loading state

    if (publications.length === 0) {
        container.innerHTML = '<p>No publications found.</p>';
        return;
    }

    // Sort by year descending (just in case)
    publications.sort((a, b) => b.year - a.year);

    const list = document.createElement('ul');
    list.className = 'pub-list';

    publications.forEach(pub => {
        const item = document.createElement('li');
        item.className = 'pub-item';

        // Highlight author
        const authors = pub.author.replace(/Chloe Game/gi, '<span class="author-highlight">Chloe Game</span>');
        
        let linksHtml = '';
        if (pub.eprint_url) {
            linksHtml += `<a href="${pub.eprint_url}" target="_blank">PDF/Link</a>`;
        }
        // Add more links if available in the data schema
        
        item.innerHTML = `
            <span class="pub-title">${pub.title}</span>
            <div class="pub-authors">${authors}</div>
            <div class="pub-venue">${pub.publication} (${pub.year})</div>
            <div class="pub-links">${linksHtml}</div>
        `;

        list.appendChild(item);
    });

    container.appendChild(list);
}
