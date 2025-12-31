require("../db/setup");

const express = require("express");
const articlesRoutes = require("./routes/articles.routes");

const app = express();
const cors = require("cors");

app.use(cors());

// middleware
app.use(express.json());

// routes
app.use("/api/articles", articlesRoutes);

// health check
app.get("/", (req, res) => {
  res.send("API running");
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
