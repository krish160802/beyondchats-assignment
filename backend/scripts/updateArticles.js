require("dotenv").config();
const axios = require("axios");
const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const API_BASE = "http://localhost:3000/api/articles";

async function fetchOriginalArticles() {
  const res = await axios.get(API_BASE);
  return res.data.filter((a) => a.type === "original");
}

(async () => {
  try {
    console.log("📥 Fetching original articles...");
    const articles = await fetchOriginalArticles();

    console.log(`✅ Found ${articles.length} original articles`);
    articles.forEach((a, i) => {
      console.log(`${i + 1}. ${a.title}`);
    });

  } catch (err) {
    console.error("❌ Error:", err.message);
  }
})();
