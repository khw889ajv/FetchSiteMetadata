const express = require('express');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const cheerio = require('cheerio');

const app = express();

app.use(cors());
app.use(express.json());

app.post('/fetch-metadata', async (req, res) => {
  const { url } = req.body;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Failed to fetch URL: ${url} with status: ${response.status}`);
      throw new Error(`Failed to fetch URL: ${url} with status: ${response.status}`);
    }
    const html = await response.text();
    const $ = cheerio.load(html);
    const metadata = {
      title: $('meta[property="og:title"]').attr('content'),
      description: $('meta[property="og:description"]').attr('content'),
      image: $('meta[property="og:image"]').attr('content'),
    };
    res.json(metadata);
  } catch (error) {
    console.error(`Error fetching metadata for URL: ${url}`, error);
    res.status(500).json({ error: 'Failed to fetch metadata', details: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
