const puppeteer = require("puppeteer");
const db = require("../src/db");

const BLOG_URL = "https://beyondchats.com/blogs/";

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  console.log("Opening BeyondChats blogs...");
  await page.goto(BLOG_URL, { waitUntil: "networkidle2" });

  
  for (let i = 0; i < 6; i++) {
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await new Promise((res) => setTimeout(res, 2000));
  }

  // Collect only real article URLs
  const articleLinks = await page.$$eval("a", (links) =>
    Array.from(
      new Set(
        links
          .map((a) => a.href)
          .filter(
            (href) =>
              href.startsWith("https://beyondchats.com/blogs/") &&
              !href.endsWith("/blogs/") &&
              !href.includes("/tag/") &&
              !href.includes("/page/") && 
              !href.includes("#")
          )
      )
    )
  );

  console.log(`Found ${articleLinks.length} candidate article links`);

  const scrapedArticles = [];

  for (const url of articleLinks) {
    console.log("Visiting:", url);

    try {
      await page.goto(url, { waitUntil: "networkidle2" });

      const article = await page.evaluate(() => {
        const title =
          document.querySelector("h1")?.innerText.trim() || "";

        const contentContainer =
          document.querySelector("div[class*='entry-content']") ||
          document.querySelector("div[class*='post-content']") ||
          document.querySelector("div[class*='content']");

        let content = "";

        if (contentContainer) {
          const paragraphs = Array.from(
            contentContainer.querySelectorAll("p")
          )
          .map(p => p.innerText.trim())
          .filter(text => text.length > 50);

          content = paragraphs.join("\n\n");
        }

        const dateText =
          document.querySelector("time")?.getAttribute("datetime") ||
          document.querySelector("time")?.innerText ||
          document
            .querySelector("meta[property='article:published_time']")
            ?.getAttribute("content") ||
          "";

        return { title, content, dateText };
      });

      if (!article.title || !article.content) {
        console.log("Skipping empty article");
        continue;
      }

      scrapedArticles.push({
        title: article.title,
        content: article.content,
        source_url: url,
        published_at: article.dateText
          ? new Date(article.dateText)
          : new Date("2100-01-01"), 
      });

    } catch (err) {
      console.log("Failed to scrape:", url);
    }
  }

  // Sort strictly by publish date (oldest first)
  scrapedArticles.sort(
    (a, b) => a.published_at - b.published_at
  );

  const oldestFive = scrapedArticles.slice(0, 5);

  for (const article of oldestFive) {
    console.log(article.title);

    db.prepare(`
      INSERT INTO articles (title, content, source_url, type)
      VALUES (?, ?, ?, 'original')
    `).run(
      article.title,
      article.content,
      article.source_url
    );
  }

  await browser.close();
  console.log("\n Scraping completed successfully");
})();
