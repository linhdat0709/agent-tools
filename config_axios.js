const axios = require("axios");

const getHeaders = (token) => {
  return {
    accept: "application/json, text/plain",
    "accept-language": "en-US,en;q=0.9",
    authorization: `${token}`,
    "content-type": "application/json",
    origin: "https://telegram.agent301.org",
    priority: "u=1 , i",
    referer: "https://telegram.agent301.org/",
  };
};

const Post = async (url, data, token) => {
  const headers = getHeaders(token);
  return await axios.post(url, data, { headers });
};

module.exports = {
  Post,
};
