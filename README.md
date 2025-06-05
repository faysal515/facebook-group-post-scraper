# Facebook Group Scraper (Playwright)

This script provides a starting point for scraping posts from public Facebook groups using Playwright. It is designed to be simple, modular, and easy to extend for open source and personal projects.

## What It Does
- Connects to an existing Chrome browser (via Playwright CDP)
- Navigates to a Facebook group feed
- Scrolls the feed multiple times to load more posts
- Expands truncated posts by clicking "See more"
- Extracts post content and HTML from the feed
- Stores unique posts in memory (no database required)
- Outputs a list of unique posts with their content and HTML

## Why Use This Script?
- **Data Collection**: Gather raw post data from Facebook groups for research, analysis, or automation.
- **Extensible**: Use as a base for more advanced processing, such as:
  - Formatting posts with GPT (e.g., GPT-4o-mini) to extract structured job data or other information
  - Connecting to a database to store posts and check for uniqueness across runs
  - Building a newsletter, job board, or alert system

## Why Are There Duplicates When Scrolling?
Facebook dynamically removes and adds posts in the DOM during scrolling, making it difficult to get a stable unique identifier. To handle this, the script uses the first 150 characters of the post content (uniqText) as a unique identifier to filter out duplicates. This approach ensures that even if the same post appears multiple times in the DOM, it is only stored once in memory.

## How to Use
1. **Start Chrome with Remote Debugging**
   ```sh
   /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-dev
   ```
2. **Install Dependencies**
   ```sh
   npm install playwright
   ```
3. **Edit the Script**
   - Set your target Facebook group URL in the script (`groupUrl` variable).
   - Adjust scroll count and delays as needed.
4. **Run the Script**
   ```sh
   node facebook-scraper.js
   ```
5. **Process the Output**
   - The script prints each unique post's content and HTML.
   - You can further process the `posts` array (e.g., send to GPT for formatting, save to a database, etc.).

## Extending This Script
- **Processing with GPT**: Pass the `post.content` to a GPT model (like GPT-4o-mini) to extract structured data (e.g., job title, company, location, etc.).
- **Database Integration**: Instead of in-memory deduplication, connect to a database (MongoDB, PostgreSQL, etc.) to persist posts and check for uniqueness across multiple runs.
- **Advanced Deduplication**: Use post IDs, URLs, or hashes for more reliable uniqueness.
- **Automation**: Integrate with a scheduler (like cron) to run the scraper periodically.

## Notes
- This script is for educational and research purposes. Scraping Facebook may violate their terms of service. Use responsibly and at your own risk.
- The script assumes you are already logged in to Facebook in the Chrome profile you connect to.
- For private groups, you must have access via the connected Chrome profile.

## Example Output
```
Successfully scraped 42 unique posts

Post ID: Looking for a React developer in Berlin...
Content: Looking for a React developer in Berlin. Please DM me if interested! ...
Timestamp: 2024-06-10T12:34:56.789Z
...
```

## License
MIT
