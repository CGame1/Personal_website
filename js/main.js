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

function highlightAuthorSimple(a, name) {
    const safe = escapeHtml(a);
    return a.toLowerCase().includes(name.toLowerCase()) ? `<span class="author-highlight">${safe}</span>` : safe;
}

function formatAuthorsHtml(authorsStr, name) {
    if (!authorsStr) return '';
    // split on ' and ' or commas
    const parts = authorsStr.split(/,| and /).map(s => s.trim()).filter(Boolean);
    const n = parts.length;

    if (n <= 4) {
        return parts.map(p => highlightAuthorSimple(p, name)).join(', ');
    }

    // find index of author's name (match first name or surname)
    const idx = parts.findIndex(p => p.toLowerCase().includes(name.toLowerCase().split(' ')[0]));

    const first = parts[0];
    const second = parts[1];
    const last = parts[n-1];

    if (idx === 0) {
        // Chloe is first author -> show first two and ellipsis
        return [highlightAuthorSimple(first, name), escapeHtml(second), '…'].join(', ');
    }
    if (idx === n - 1) {
        // Chloe is last author -> show first, ellipsis, Chloe
        return `${escapeHtml(first)}, …, ${highlightAuthorSimple(parts[idx], name)}`;
    }

    if (idx > 0) {
        // Chloe is in middle -> show first, ellipsis, Chloe, ellipsis, last
        return `${escapeHtml(first)}, …, ${highlightAuthorSimple(parts[idx], name)}, …, ${escapeHtml(last)}`;
    }

    // fallback: show first two, ellipsis, last
    return `${escapeHtml(first)}, ${escapeHtml(second)}, …, ${escapeHtml(last)}`;
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
        const authorsHtml = formatAuthorsHtml(authorsRaw, 'Chloe Game');
        const year = pub.year || '';

        // build links HTML (small pop-out to the right)
        const links = [];
        if (pub.eprint_url) links.push({label: 'PDF', url: pub.eprint_url});
        if (pub.doi) links.push({label: 'DOI', url: `https://doi.org/${encodeURIComponent(pub.doi)}`});
        if (pub.arxiv_id) links.push({label: 'arXiv', url: pub.arxiv_id.startsWith('http') ? pub.arxiv_id : `https://arxiv.org/abs/${encodeURIComponent(pub.arxiv_id)}`});

        let linksHtml = links.map(l => `<a href="${escapeHtml(l.url)}" target="_blank" rel="noopener noreferrer" class="pub-link-small">${escapeHtml(l.label)}</a>`).join(' ');

        item.innerHTML = `
            <div class="pub-meta">
                <div class="pub-title-wrap"><span class="pub-title">${title}</span><span class="pub-year">${year ? `, ${year}` : ''}</span></div>
                <div class="pub-links">${linksHtml}</div>
            </div>
            <div class="pub-authors">${authorsHtml}</div>
        `;

        list.appendChild(item);
    });

    container.appendChild(list);
}
