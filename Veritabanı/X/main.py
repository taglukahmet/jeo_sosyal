# main.py
from twitterbot import Twitterbot
import secrets
import sys, os, time

def read_hashtags(path: str):
    """
    Reads hashtags from a text file.
    - One per line OR comma/space-separated.
    - Accepts '#tag' or 'tag'.
    - Full-line comments: '# ' (hash + space), '//', ';', '-- ', 'REM ' (case-insensitive)
    - Inline comments after space + '#': e.g. 'iklim  # note'
    - De-duplicates case-insensitively, preserves first-seen order.
    """
    if not os.path.exists(path):
        raise FileNotFoundError(f"Hashtag file not found: {path}")

    tags, seen = [], set()
    with open(path, "r", encoding="utf-8") as f:
        for raw in f:
            line = raw.strip()
            if not line:
                continue
            # full-line comments
            if (line.startswith("# ") or line.startswith("//") or line.startswith(";")
                or line.startswith("-- ") or line.lower().startswith("rem ")):
                continue
            # strip inline comments that begin with space + '#'
            if " #" in line:
                line = line.split(" #", 1)[0].strip()
                if not line:
                    continue
            # split by commas or spaces
            for tok in line.replace(",", " ").split():
                tag = tok.lstrip("#").strip()
                if not tag:
                    continue
                key = tag.lower()
                if key not in seen:
                    seen.add(key)
                    tags.append(tag)
    return tags

def main():
    # read file path from CLI (default: hashtags.txt)
    path = sys.argv[1] if len(sys.argv) >= 2 and not sys.argv[1].startswith("#") else "hashtags.txt"
    hashtags = read_hashtags(path)
    if not hashtags:
        print(f"No hashtags found in {path}.")
        sys.exit(1)

    print(f"Loaded {len(hashtags)} hashtags from {path}: {', '.join('#'+h for h in hashtags)}")

    credentials = secrets.get_credentials()
    bot = Twitterbot(credentials["email"], credentials["password"])
    try:
        bot.login()
        for i, tag in enumerate(hashtags, 1):
            print(f"\n=== {i}/{len(hashtags)} — scraping #{tag} ===")
            bot.scrape_hashtag(
                tag,
                rounds=750,
                row_limit=300,          # also acts as row limit in your current bot
                since_days=365,
                cooldown_every_n_rows=50,
                session_row_cap = 300,
                safe_rate_limits=True,
                timeout_seconds=1000,
                auto_close_on_complete=False  # keep the session alive for the next tag
            )
            time.sleep(2)  # small pause between tags
    finally:
        bot.close()

if __name__ == "__main__":
    main()
