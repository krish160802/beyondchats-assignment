import axios from "axios";

const API_BASE = "https://beyondchats-assignment-0nfm.onrender.com/api/articles";

export const fetchArticles = async () => {
  const res = await axios.get(API_BASE);
  return res.data;
};
