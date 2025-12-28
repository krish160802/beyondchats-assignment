const express = require("express");
const router = express.Router();
const db = require("../db");

// CREATE article
router.post("/", (req, res) => {
  const {
    title,
    content,
    source_url,
    type,
    parent_id = null,
    reference_urls = null,
  } = req.body;

  const stmt = db.prepare(`
    INSERT INTO articles 
    (title, content, source_url, type, parent_id, reference_urls)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    title,
    content,
    source_url,
    type,
    parent_id,
    reference_urls ? JSON.stringify(reference_urls) : null
  );

  res.status(201).json({ id: result.lastInsertRowid });
});

// READ all articles
router.get("/", (req, res) => {
  const rows = db
    .prepare("SELECT * FROM articles ORDER BY created_at DESC")
    .all();

  const parsed = rows.map((row) => ({
    ...row,
    reference_urls: row.reference_urls
      ? JSON.parse(row.reference_urls)
      : null,
  }));

  res.json(parsed);
});

// READ single article
router.get("/:id", (req, res) => {
  const article = db
    .prepare("SELECT * FROM articles WHERE id = ?")
    .get(req.params.id);

  if (!article) {
    return res.status(404).json({ message: "Article not found" });
  }

  article.reference_urls = article.reference_urls
    ? JSON.parse(article.reference_urls)
    : null;

  res.json(article);
});

// UPDATE article
router.put("/:id", (req, res) => {
  const { title, content } = req.body;

  const result = db.prepare(`
    UPDATE articles
    SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(title, content, req.params.id);

  res.json({ updated: result.changes });
});

// DELETE article
router.delete("/:id", (req, res) => {
  const result = db
    .prepare("DELETE FROM articles WHERE id = ?")
    .run(req.params.id);

  res.json({ deleted: result.changes });
});

module.exports = router;
