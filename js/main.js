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

function escapeHtml(str) {
    return str.replace(/[&<>\`"']/g, function(m) { return ({'&':'&amp;','<':'&lt;','>':'&gt;','`':'&#96;','"':'&quot;',"'":"&#39;"})[m]; });
}

function highlightAuthor(authorsStr, name) {
    // Split authors by comma or ' and '
    const parts = authorsStr.split(/,| and /).map(s => s.trim()).filter(Boolean);
    return parts.map((a, i) => {
        const safe = escapeHtml(a);
        if (a.toLowerCase() === name.toLowerCase()) {
            return `<span class="author-highlight">${safe}</span>`;
        }
        return safe;
    }).join(', ');
}

function renderPublications(publications, container) {
    container.innerHTML = ''; // Clear loading state

    if (!Array.isArray(publications) || publications.length === 0) {
        container.innerHTML = '<p>No publications found.</p>';
        return;
    }

    // Sort by year descending (just in case)
    publications.sort((a, b) => (b.year || 0) - (a.year || 0));

    const list = document.createElement('ul');
    list.className = 'pub-list';

    publications.forEach(pub => {
        const item = document.createElement('li');
        item.className = 'pub-item';

        const title = escapeHtml(pub.title || 'Untitled');
        const authorsRaw = pub.author || pub.authors || '';
        const authorsHtml = highlightAuthor(authorsRaw, 'Chloe Game');
        const venue = escapeHtml(pub.publication || pub.venue || '');
        const year = pub.year || '';

        let linksHtml = '';
        if (pub.eprint_url) {
            linksHtml += `<a href="${escapeHtml(pub.eprint_url)}" target="_blank" rel="noopener noreferrer">PDF/Link</a>`;
        }
        if (pub.doi) {
            const doiUrl = `https://doi.org/${encodeURIComponent(pub.doi)}`;
            linksHtml += (linksHtml ? ' | ' : '') + `<a href="${doiUrl}" target="_blank" rel="noopener noreferrer">DOI</a>`;
        }
        if (pub.arxiv_id) {
            const arxivUrl = pub.arxiv_id.startsWith('http') ? pub.arxiv_id : `https://arxiv.org/abs/${encodeURIComponent(pub.arxiv_id)}`;
            linksHtml += (linksHtml ? ' | ' : '') + `<a href="${arxivUrl}" target="_blank" rel="noopener noreferrer">arXiv</a>`;
        }

        item.innerHTML = `
            <div class="pub-meta">
                <span class="pub-title">${title}</span>
                <span class="pub-year">${year ? `, ${year}` : ''}</span>
            </div>
            <div class="pub-authors">${authorsHtml}</div>
            <div class="pub-venue">${venue}</div>
            <div class="pub-links">${linksHtml}</div>
        `;

        list.appendChild(item);
    });

    container.appendChild(list);
}
