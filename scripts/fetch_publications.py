import json
import os
import sys
from scholarly import scholarly

def fetch_publications(author_name_or_id, use_id=False):
    print(f"Searching for author: {author_name_or_id} (ID mode: {use_id})")
    
    try:
        if use_id:
            author = scholarly.search_author_id(author_name_or_id)
        else:
            search_query = scholarly.search_author(author_name_or_id)
            author = next(search_query)
        
        print(f"Found author: {author['name']} ({author['scholar_id']})")
        
        # Fill sections
        print("Fetching publications...")
        try:
            scholarly.fill(author, sections=['publications'])
        except Exception as e:
            print(f"Error filling author data: {e}. Trying to continue with available data.")
        
        publications = []
        # Sort by year descending to ensure latest are first (scholarly might not guarantee order)
        sorted_pubs = sorted(author['publications'], key=lambda x: x['bib'].get('pub_year', '0'), reverse=True)

        if sorted_pubs:
            print(f"Debug - First pub keys: {sorted_pubs[0].keys()}")
            print(f"Debug - First pub content: {sorted_pubs[0]}")

        for i, pub in enumerate(sorted_pubs):
            try:
                # Fill the publication to get more details like authors
                # This might be slow if there are many publications
                print(f"Fetching details for publication {i+1}/{len(sorted_pubs)}: {pub['bib'].get('title', 'Unknown')}")
                scholarly.fill(pub)
            except Exception as e:
                print(f"Failed to fill publication {pub['bib'].get('title', 'Unknown')}: {e}")
            
            bib = pub['bib']
            # scholarly 'author' field in bib is sometimes a list or string, or missing
            authors_list = bib.get("author", "Unknown")
            if isinstance(authors_list, list):
                 authors_list = ", ".join(authors_list)
            
            pub_data = {
                "title": bib.get("title"),
                "authors": authors_list,
                "year": bib.get("pub_year", "Unknown"),
                "venue": bib.get("citation", ""), 
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
    target_id = os.environ.get("GOOGLE_SCHOLAR_ID")
    target_author = os.environ.get("GOOGLE_SCHOLAR_AUTHOR_NAME")
    
    if target_id:
        publications = fetch_publications(target_id, use_id=True)
    elif target_author:
        publications = fetch_publications(target_author, use_id=False)
    else:
        print("Error: Neither GOOGLE_SCHOLAR_ID nor GOOGLE_SCHOLAR_AUTHOR_NAME environment variable set.")
        sys.exit(1)
    
    # Path to save inside public/data/
    output_path = os.path.join("public", "data", "publications.json")
    save_publications(publications, output_path)
