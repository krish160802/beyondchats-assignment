const puppeteer = require("puppeteer");
const db = require("../src/db");

const BLOG_URL = "https://beyondchats.com/blogs/";

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  console.log("🔍 Opening BeyondChats blogs...");
  await page.goto(BLOG_URL, { waitUntil: "networkidle2" });

  // Scroll to bottom multiple times to load oldest posts
  for (let i = 0; i < 5; i++) {
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await new Promise((res) => setTimeout(res, 2000));
  }

  // Collect article links
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
                !href.includes("#")
          )
      )
    )
  );

  // Pick the oldest 5 articles (last ones)
  const oldestFive = articleLinks.slice(-5);

  console.log(`📄 Found ${oldestFive.length} oldest articles`);

  for (const url of oldestFive) {
    console.log("📝 Scraping:", url);
    await page.goto(url, { waitUntil: "networkidle2" });

    const article = await page.evaluate(() => {
      const title =
        document.querySelector("h1")?.innerText?.trim() || "";

      const contentElement =
        document.querySelector("article") ||
        document.querySelector("main");

      const content = contentElement
        ? contentElement.innerText.trim()
        : "";

      return { title, content };
    });

    if (!article.title || !article.content) {
      console.log("⚠️ Skipping empty article");
      continue;
    }

    db.prepare(
      `
      INSERT INTO articles (title, content, source_url, type)
      VALUES (?, ?, ?, 'original')
    `
    ).run(article.title, article.content, url);

    console.log("✅ Saved:", article.title);
  }

  await browser.close();
  console.log("🎉 Scraping completed successfully");
})();
