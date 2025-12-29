require("dotenv").config();
const axios = require("axios");
const cheerio = require("cheerio");
const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const API_BASE = "http://localhost:3000/api/articles";
const SERP_API_KEY = process.env.SERP_API_KEY;

// helper functions

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
  const res = await axios.get(url, {
    timeout: 15000,
    headers: {
      "User-Agent": "Mozilla/5.0 (BeyondChatsBot)",
    },
  });

  const $ = cheerio.load(res.data);

  const selectors = [
    "article",
    "main",
    "div[class*='content']",
    "div[class*='article']",
  ];

  let content = "";
  for (const selector of selectors) {
    const text = $(selector).text().trim();
    if (text.length > 500) {
      content = text;
      break;
    }
  }

  if (!content) content = $("body").text().trim();

  return content.replace(/\s+/g, " ").slice(0, 5000);
}

async function rewriteWithGroq(original, ref1, ref2) {
  const prompt = `
    You are a professional content editor.

    TASK:
    Rewrite and improve the ORIGINAL ARTICLE using the REFERENCE ARTICLES only for structure, tone, and idea inspiration.

    RULES:
    - DO NOT copy sentences from reference articles.
    - DO NOT plagiarize.
    - Keep the original topic and intent.
    - Improve clarity, depth, and formatting.
    - Use clear headings and subheadings.
    - Write in a professional blog style.

    ORIGINAL ARTICLE:
    ${original}

    REFERENCE ARTICLE 1:
    ${ref1}

    REFERENCE ARTICLE 2:
    ${ref2}

    OUTPUT:
    Return ONLY the improved article content.
    `;
    

  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  return completion.choices[0].message.content;
}

// main 

(async () => {
  try {
    console.log("Fetching original articles...");
    const articles = await fetchOriginalArticles();
    if (!articles.length) return;

    const article = articles[0];
    console.log(`Processing: ${article.title}`);

    const searchResults = await googleSearch(article.title);
    if (searchResults.length < 2) return;

    const ref1 = await scrapeExternalArticle(searchResults[0].link);
    const ref2 = await scrapeExternalArticle(searchResults[1].link);

    if (ref1.length < 1000 || ref2.length < 1000) {
        throw new Error("Reference article too short — scraping failed");
    }

    const rewritten = await rewriteWithGroq(
      article.content,
      ref1,
      ref2
    );

    const finalContent = `
${rewritten}

---

### References
1. ${searchResults[0].link}
2. ${searchResults[1].link}
`;

    console.log("Publishing updated article via API...");

    const res = await axios.post(API_BASE, {
      title: `Updated: ${article.title}`,
      content: finalContent,
      type: "updated",
      parent_id: article.id,
      reference_urls: [
        searchResults[0].link,
        searchResults[1].link,
      ],
    });

    console.log("Updated article published with ID:", res.data.id);

  } catch (err) {
    console.error("Error:", err.message);
  }
})();
