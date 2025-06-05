const { chromium } = require("playwright");

class FacebookGroupScraper {
  constructor(options = {}) {
    this.options = {
      scrollCount: 5,
      scrollDelay: 3000,
      initialLoadDelay: 5000,
      ...options,
    };
    this.browser = null;
    this.page = null;
    this.posts = new Map(); // Using Map to store unique posts
  }

  async initialize() {
    try {
      this.browser = await chromium.connectOverCDP("http://localhost:9222");
      const context = this.browser.contexts()[0];
      this.page = await context.newPage();
    } catch (error) {
      throw new Error(`Failed to initialize scraper: ${error.message}`);
    }
  }

  async scrapeGroup(groupUrl) {
    try {
      await this.initialize();
      console.log(`Navigating to group: ${groupUrl}`);

      await this.page.goto(groupUrl);
      await this.page.waitForTimeout(this.options.initialLoadDelay);
      await this.page.waitForSelector('div[role="feed"]');

      // Initial post collection
      await this.collectPosts();

      // Scroll and collect more posts
      for (let i = 0; i < this.options.scrollCount; i++) {
        console.log(`\n=== Scroll ${i + 1}/${this.options.scrollCount} ===`);
        await this.scrollPage();
        await this.collectPosts();
      }

      return Array.from(this.posts.values());
    } catch (error) {
      console.error("Error during scraping:", error);
      throw error;
    } finally {
      await this.cleanup();
    }
  }

  async scrollPage() {
    await this.page.evaluate(() => {
      window.scrollBy(0, window.innerHeight * 1.2);
    });
    await this.page.waitForTimeout(this.options.scrollDelay);
  }

  async collectPosts() {
    const newPosts = await this.page.evaluate(() => {
      const feed = document.querySelector('div[role="feed"]');
      if (!feed) return [];

      const children = Array.from(feed.children);
      const contentDivs = children.slice(1);

      return contentDivs
        .map((div) => {
          // Expand truncated content if it exists
          const seeMoreButton = Array.from(
            div.querySelectorAll('div[role="button"]')
          ).find((button) => button.textContent.trim() === "See more");

          if (seeMoreButton) {
            try {
              seeMoreButton.click();
            } catch (err) {
              console.log('Failed to click "See more":', err.message);
            }
          }

          // Extract post content
          const htmlDiv = div.querySelector('div[class*="html-div"]');
          if (!htmlDiv) return null;

          const descSpan =
            div.querySelector('span[data-ad-rendering-role="description"]') ||
            div.querySelector('div[data-ad-comet-preview="message"]');

          if (!descSpan || !descSpan.textContent) return null;

          const uniqText = descSpan.textContent
            .trim()
            .replace(/\s+/g, " ")
            .substring(0, 150);

          return {
            id: uniqText, // Using text as unique identifier
            content: descSpan.textContent.trim(),
            html: htmlDiv.outerHTML,
            timestamp: new Date().toISOString(),
          };
        })
        .filter((post) => post !== null);
    });

    // Add new posts to Map (automatically handles duplicates)
    newPosts.forEach((post) => {
      this.posts.set(post.id, post);
    });

    console.log(`Total unique posts collected: ${this.posts.size}`);
  }

  async cleanup() {
    if (this.page) await this.page.close();
    if (this.browser) await this.browser.close();
  }
}

if (require.main === module) {
  const scraper = new FacebookGroupScraper({
    scrollCount: 6,
    scrollDelay: 3000,
    initialLoadDelay: 5000,
  });

  const groupUrl = "<group_url>";

  scraper
    .scrapeGroup(groupUrl)
    .then((posts) => {
      console.log(`Successfully scraped ${posts.length} unique posts`);
      posts.forEach((post) => {
        /**
         * This is just inner text of the post with some text manipulation required to get formatted output.
         * use gpt-4o-mini to get the desired output.
         * i've used it for public jobs related groups to get formatted job data
         */
        console.log(`\nPost ID: ${post.id}`);
        console.log(`Content: ${post.content.substring(0, 100)}...`);
        console.log(`Timestamp: ${post.timestamp}`);
      });
    })
    .catch((err) => {
      console.error("Scraping failed:", err);
      process.exit(1);
    });
}

module.exports = FacebookGroupScraper;
