#!/usr/bin/env python3
"""
Fetch publications from Google Scholar and write a static JSON file.
This script is intended for use in GitHub Actions (CI) only.
"""
import argparse
import json
import time
from scholarly import scholarly

def fetch_publications(scholar_id, verbose=False):
    # Get author and initial publications list
    author = scholarly.search_author_id(scholar_id)
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
        time.sleep(1.0)

    return pubs


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--scholar-id', required=True)
    parser.add_argument('--out', default='data/publications.json')
    parser.add_argument('--verbose', action='store_true', help='Enable verbose logging')
    args = parser.parse_args()

    pubs = fetch_publications(args.scholar_id, verbose=args.verbose)
    # Ensure reverse chronological order by year then title
    pubs = sorted(pubs, key=lambda x: (-x.get('year', 0), x.get('title', '')))

    with open(args.out, 'w', encoding='utf-8') as f:
        json.dump(pubs, f, indent=2, ensure_ascii=False)

    print(f"Wrote {len(pubs)} publications to {args.out}")

if __name__ == '__main__':
    main()
