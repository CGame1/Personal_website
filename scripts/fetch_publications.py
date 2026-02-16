#!/usr/bin/env python3
"""
Fetch publications from Google Scholar and write a static JSON file.
This script is intended for use in GitHub Actions (CI) only.
"""
import argparse
import json
import time
import sys
from scholarly import scholarly
from scholarly import ProxyGenerator


def setup_proxy(verbose=False):
    """Try to configure a ProxyGenerator (free proxies). Return True if configured."""
    try:
        pg = ProxyGenerator()
        ok = pg.FreeProxies()
        if ok:
            scholarly.use_proxy(pg)
            if verbose:
                print("[info] Using free proxy generator for scholarly")
            return True
        else:
            if verbose:
                print("[warning] ProxyGenerator.FreeProxies() returned False — continuing without proxy")
    except Exception as e:
        if verbose:
            print(f"[warning] Proxy setup failed: {e}")
    return False


def retry_search_author_id(scholar_id, max_attempts=5, verbose=False):
    """Attempt to call scholarly.search_author_id with retries and exponential backoff."""
    for attempt in range(1, max_attempts + 1):
        try:
            if verbose:
                print(f"[info] Attempting to fetch author (attempt {attempt}/{max_attempts})")
            return scholarly.search_author_id(scholar_id)
        except Exception as e:
            if attempt == max_attempts:
                if verbose:
                    print(f"[error] search_author_id failed after {max_attempts} attempts: {e}")
                raise
            wait = 5 * attempt
            if verbose:
                print(f"[warning] search_author_id failed (attempt {attempt}): {e}. Retrying in {wait}s...")
            time.sleep(wait)


def fetch_publications(scholar_id, verbose=False):
    # Try to set up a proxy first (helps in CI environments)
    setup_proxy(verbose=verbose)

    # Get author and initial publications list (with retries)
    author = retry_search_author_id(scholar_id, max_attempts=6, verbose=verbose)
    author = scholarly.fill(author, sections=['publications'])
    publications_raw = author.get('publications', [])
    if verbose:
        print(f"Found {len(publications_raw)} publications in profile")
    pubs = []

    for idx, p in enumerate(publications_raw):
        if verbose:
            print(f"\nProcessing publication {idx+1}/{len(publications_raw)}: {p.get('bib', {}).get('title', '(no title)')}")
        # Fill each publication to ensure detailed bib fields are present
        try:
            pub_filled = scholarly.fill(p)
        except Exception as e:
            if verbose:
                print(f"  Warning: scholarly.fill() failed for item {idx+1}: {e}")
            pub_filled = p

        bib = pub_filled.get('bib', {}) if isinstance(pub_filled, dict) else {}

        title = bib.get('title', '')
        authors = bib.get('author', '') or bib.get('authors', '') or ''
        venue = bib.get('venue', '') or bib.get('journal', '') or pub_filled.get('source', '') or ''

        # Year: try multiple locations and coerce to int when possible
        year_raw = bib.get('pub_year') or bib.get('year') or pub_filled.get('year') or 0
        try:
            year = int(year_raw) if year_raw else 0
        except Exception:
            year = 0

        # URLs / identifiers
        eprint_url = pub_filled.get('eprint_url') or bib.get('url', '') or pub_filled.get('pub_url', '') or ''
        doi = bib.get('doi', '')
        arxiv_id = bib.get('eprint', '')
        if not eprint_url and arxiv_id:
            # construct arXiv URL when only id is present
            eprint_url = f"https://arxiv.org/abs/{arxiv_id}"

        if verbose:
            print(f"  title: {title}\n  authors: {authors}\n  venue: {venue}\n  year: {year}\n  eprint_url: {eprint_url}\n  doi: {doi}\n  arxiv_id: {arxiv_id}")

        entry = {
            'title': title,
            'author': authors,
            'publication': venue,
            'year': year,
            'eprint_url': eprint_url,
            'doi': doi,
            'arxiv_id': arxiv_id
        }

        pubs.append(entry)

        # polite delay to reduce rate-limiting / blocking risk
        time.sleep(2.0)

    return pubs


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--scholar-id', required=True)
    parser.add_argument('--out', default='data/publications.json')
    parser.add_argument('--verbose', action='store_true', help='Enable verbose logging')
    args = parser.parse_args()

    try:
        pubs = fetch_publications(args.scholar_id, verbose=args.verbose)
    except Exception as e:
        print(f"[error] Failed to fetch publications: {e}")
        # If fetch fails in CI, attempt to preserve existing file (if any) and exit non-zero
        sys.exit(1)

    # Ensure reverse chronological order by year then title
    pubs = sorted(pubs, key=lambda x: (-x.get('year', 0), x.get('title', '')))

    with open(args.out, 'w', encoding='utf-8') as f:
        json.dump(pubs, f, indent=2, ensure_ascii=False)

    print(f"Wrote {len(pubs)} publications to {args.out}")

if __name__ == '__main__':
    main()
