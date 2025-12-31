import axios from "axios";

const API_BASE = "http://localhost:3000/api/articles";

export const fetchArticles = async () => {
  const res = await axios.get(API_BASE);
  return res.data;
};
