#!/usr/bin/env python3
# CLI to fetch LinkedIn user profiles using existing session pickle
import json
import argparse
from pathlib import Path
from staffspy import LinkedInAccount

"""
CLI tool to fetch LinkedIn profile data and save as JSON.
"""
def parse_args():
    p = argparse.ArgumentParser(description='Fetch LinkedIn profiles to JSON')
    p.add_argument('-o','--out', default='data/linkedin.json', help='Output JSON file path')
    p.add_argument('-u','--user-ids', nargs='+', default=['federicogmz'], help='LinkedIn user IDs')
    p.add_argument('-s','--session-file', default='data/session.pkl', help='Path to saved session pickle')
    return p.parse_args()

def main():
    args = parse_args()
    # ensure output directory exists
    Path(args.out).parent.mkdir(parents=True, exist_ok=True)
    # Initialize with existing session (no interactive login)
    account = LinkedInAccount(
        session_file=args.session_file,
        log_level=1
    )
    # Fetch detailed profiles including summary and experience descriptions
    # Fetch profiles data
    df = account.scrape_users(user_ids=args.user_ids)
    if df is None or df.empty:
        print('No user data fetched.')
        return
    records = df.to_dict(orient='records')
    # Ensure bio field exists and map blank descriptions for experiences
    for rec in records:
        rec.setdefault('bio', '')
        for exp in rec.get('experiences', []):
            exp.setdefault('description', '')
    # write JSON
    with open(args.out,'w',encoding='utf-8') as f:
        json.dump(records, f, ensure_ascii=False, indent=2)
    print(f"Wrote {len(records)} profiles to {args.out}")

if __name__ == '__main__':
    main()