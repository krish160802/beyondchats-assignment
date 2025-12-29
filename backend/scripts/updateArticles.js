require("dotenv").config();
const axios = require("axios");
const cheerio = require("cheerio");
const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const API_BASE = "http://localhost:3000/api/articles";
const SERP_API_KEY = process.env.SERP_API_KEY;

// helper function

async function fetchOriginalArticles() {
  const res = await axios.get(API_BASE);
  return res.data.filter((a) => a.type === "original");
}

async function googleSearch(query) {
  const url = "https://serpapi.com/search.json";

  const res = await axios.get(url, {
    params: {
      engine: "google",
      q: query,
      api_key: SERP_API_KEY,
      num: 10,
    },
  });

  const results = res.data.organic_results || [];

  return results
    .filter(
      (r) =>
        r.link &&
        !r.link.includes("beyondchats.com") &&
        !r.link.includes("youtube.com")
    )
    .slice(0, 2)
    .map((r) => ({
      title: r.title,
      link: r.link,
    }));
}

async function scrapeExternalArticle(url) {
  console.log(`🌐 Scraping external article: ${url}`);

  const res = await axios.get(url, {
    timeout: 15000,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; BeyondChatsBot/1.0; +https://beyondchats.com)",
    },
  });

  const $ = cheerio.load(res.data);

  let content = "";

  const selectors = [
    "article",
    "main",
    "div[class*='content']",
    "div[class*='article']",
  ];

  for (const selector of selectors) {
    const text = $(selector).text().trim();
    if (text.length > 500) {
      content = text;
      break;
    }
  }

  
  if (!content) {
    content = $("body").text().trim();
  }

  content = content.replace(/\s+/g, " ").trim();

  return content.slice(0, 6000); // limit size for LLM
}

// main 

(async () => {
  try {
    console.log("📥 Fetching original articles...");
    const articles = await fetchOriginalArticles();

    if (articles.length === 0) {
      console.log("⚠️ No original articles found");
      return;
    }

    const article = articles[0];
    console.log(`\n🔎 Google search for: "${article.title}"`);

    const searchResults = await googleSearch(article.title);

    if (searchResults.length < 2) {
      console.log("❌ Not enough external articles found");
      return;
    }

    const scrapedContents = [];

    for (const result of searchResults) {
      const text = await scrapeExternalArticle(result.link);
      scrapedContents.push({
        title: result.title,
        url: result.link,
        content: text,
      });
    }

    console.log("\n✅ External articles scraped successfully:\n");
    scrapedContents.forEach((a, i) => {
      console.log(`${i + 1}. ${a.title}`);
      console.log(`   Content length: ${a.content.length} chars\n`);
    });

  } catch (err) {
    console.error("❌ Error:", err.message);
  }
})();

// (async () => {
//   try {
//     const testUrl =
//       "https://export.ebay.com/in/resources/weblog/10-common-customer-service-problems-and-their-solutions/";

//     console.log("🧪 Testing scrapeExternalArticle() manually...\n");

//     const content = await scrapeExternalArticle(testUrl);

//     console.log("✅ Scraping successful");
//     console.log("Content length:", content.length);
//     console.log("\n📄 Preview:\n");
//     console.log(content.slice(0, 800)); // preview first 800 chars
//   } catch (err) {
//     console.error("❌ Error:", err.message);
//   }
// })();
