#!/usr/bin/env python3
"""
Fetch publications from Google Scholar and write a static JSON file.
This script is intended for use in GitHub Actions (CI) only.
"""
import argparse
import json
from scholarly import scholarly

def fetch_publications(scholar_id):
    author = scholarly.search_author_id(scholar_id)
    author = scholarly.fill(author, sections=['publications'])
    pubs = []
    for p in author.get('publications', []):
        entry = {
            'title': p.get('bib', {}).get('title', ''),
            'author': p.get('bib', {}).get('author', ''),
            'publication': p.get('bib', {}).get('venue', '') or p.get('bib', {}).get('journal', ''),
            'year': int(p.get('bib', {}).get('pub_year', 0) or 0),
            'eprint_url': p.get('eprint_url') or p.get('bib', {}).get('url', ''),
            'doi': p.get('bib', {}).get('doi', ''),
            'arxiv_id': p.get('bib', {}).get('eprint', '')
        }
        pubs.append(entry)
    return pubs


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--scholar-id', required=True)
    parser.add_argument('--out', default='data/publications.json')
    args = parser.parse_args()

    pubs = fetch_publications(args.scholar_id)
    # Ensure reverse chronological order by year then title
    pubs = sorted(pubs, key=lambda x: (-x.get('year', 0), x.get('title', '')))

    with open(args.out, 'w', encoding='utf-8') as f:
        json.dump(pubs, f, indent=2, ensure_ascii=False)

    print(f"Wrote {len(pubs)} publications to {args.out}")

if __name__ == '__main__':
    main()
