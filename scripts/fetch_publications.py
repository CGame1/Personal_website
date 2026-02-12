import json
import os
import sys
from scholarly import scholarly

def fetch_publications(author_name_or_id):
    print(f"Searching for author: {author_name_or_id}")
    
    try:
        # Try to search by ID first if it looks like an ID
        # Only feasible if we knew the ID format, but scholarly search_author_id takes ID.
        # Here we mix logic or just use search_author for name.
        # If it's a name:
        search_query = scholarly.search_author(author_name_or_id)
        author = next(search_query)
        print(f"Found author: {author['name']} ({author['scholar_id']})")
        
        # Fill sections
        print("Fetching publications...")
        scholarly.fill(author, sections=['publications'])
        
        publications = []
        for pub in author['publications']:
            bib = pub['bib']
            pub_data = {
                "title": bib.get("title"),
                "authors": bib.get("author", "Unknown"),
                "year": bib.get("pub_year", "Unknown"),
                "venue": bib.get("citation", ""), # scholarly puts venue in citation often
                "url": pub.get("pub_url", ""),
                "citation_url": pub.get("citedby_url", "")
            }
            publications.append(pub_data)
            
        return publications

    except StopIteration:
        print("Author not found.")
        return []
    except Exception as e:
        print(f"An error occurred: {e}")
        return []

def save_publications(publications, filepath):
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(publications, f, indent=2, ensure_ascii=False)
    print(f"Saved {len(publications)} publications to {filepath}")

if __name__ == "__main__":
    # Get configuration from Environment Variables
    # AUTHOR_ID is preferred, currently using name as fallback/placeholder
    target_author = os.environ.get("GOOGLE_SCHOLAR_AUTHOR_NAME")
    
    if not target_author:
        print("Error: GOOGLE_SCHOLAR_AUTHOR_NAME environment variable not set.")
        print("Please set it to your Google Scholar name or ID.")
        # For development, we can exit or use a placeholder if testing.
        sys.exit(1)
        
    publications = fetch_publications(target_author)
    
    # Path to save inside public/data/
    output_path = os.path.join("public", "data", "publications.json")
    save_publications(publications, output_path)
