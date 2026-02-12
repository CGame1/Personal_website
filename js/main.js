document.addEventListener('DOMContentLoaded', () => {
    fetchPublications();
    // Theme toggle setup
    try {
        const btn = document.getElementById('theme-toggle');
        if (btn) {
            const root = document.documentElement;
            // Ensure default is dark if no preference stored
            const stored = localStorage.getItem('theme');
            if (!stored) {
                root.setAttribute('data-theme', 'dark');
            } else {
                root.setAttribute('data-theme', stored);
            }
            const updateIcon = () => { btn.textContent = root.getAttribute('data-theme') === 'dark' ? '🌙' : '☀️'; };
            updateIcon();
            btn.addEventListener('click', () => {
                const current = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
                root.setAttribute('data-theme', current);
                localStorage.setItem('theme', current);
                updateIcon();
            });
        }
    } catch (e) {
        console.warn('Theme toggle init failed', e);
    }
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

// Match author name variants robustly (e.g. "Chloe Game", "Chloe A Game", "Chloe Amanda Game")
function authorMatchesName(authorName, targetFullName) {
    if (!authorName || !targetFullName) return false;
    const a = authorName.toLowerCase();
    const t = targetFullName.toLowerCase().trim();

    // direct substring match first
    if (a.includes(t)) return true;

    const tParts = t.split(/\s+/).filter(Boolean);
    if (tParts.length === 0) return false;

    const first = tParts[0];
    const last = tParts[tParts.length - 1];

    // require both first and last name tokens to appear somewhere in the author string
    if (a.includes(first) && a.includes(last)) return true;

    // allow first initial + last (e.g., "C. A. Game" or "C A Game" or "C Game")
    const firstInitial = first.charAt(0);
    const initialPattern = new RegExp(`\b${firstInitial}[\\.\s]*${last}\b`);
    if (initialPattern.test(a)) return true;

    // fallback: match last name and any occurrence of the first name initial
    if (a.includes(last) && a.includes(firstInitial)) return true;

    return false;
}

function highlightAuthorSimple(a, name) {
    const safe = escapeHtml(a);
    return authorMatchesName(a, name) ? `<span class="author-highlight">${safe}</span>` : safe;
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
    const idx = parts.findIndex(p => authorMatchesName(p, name));

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
        if (pub.eprint_url) links.push({label: '↗', url: pub.eprint_url, title: 'Open PDF in new tab'});
        if (pub.doi) links.push({label: 'DOI', url: `https://doi.org/${encodeURIComponent(pub.doi)}`, title: 'Open DOI in new tab'});
        if (pub.arxiv_id) links.push({label: 'arXiv', url: pub.arxiv_id.startsWith('http') ? pub.arxiv_id : `https://arxiv.org/abs/${encodeURIComponent(pub.arxiv_id)}`, title: 'Open arXiv in new tab'});

        let linksHtml = links.map(l => `<a href="${escapeHtml(l.url)}" target="_blank" rel="noopener noreferrer" class="pub-link-small" title="${escapeHtml(l.title)}" aria-label="${escapeHtml(l.title)}">${escapeHtml(l.label)}</a>`).join(' ');

        item.innerHTML = `
            <div class="pub-meta">
                <div class="pub-title-wrap"><span class="pub-title">${title}</span></div>
                <div class="pub-links">${linksHtml}</div>
            </div>
            <div class="pub-authors">${authorsHtml}</div>
            <div class="pub-year">${year ? escapeHtml(String(year)) : ''}</div>
        `;

        list.appendChild(item);
    });

    container.appendChild(list);
}
