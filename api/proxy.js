export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Auth-Token');
  if (req.method === 'OPTIONS') return res.status(200).end();
  
  const { source, url } = req.query;
  if (!source || !url) return res.status(400).json({ error: 'Missing source or url' });
  
  const API_KEYS = { 'football-data': process.env.FOOTBALL_DATA_API_KEY, 'api-football': process.env.API_FOOTBALL_KEY };
  const API_BASES = { 'football-data': 'https://api.football-data.org/v4', 'api-football': 'https://v3.football.api-sports.io' };
  
  const apiKey = API_KEYS[source];
  if (!apiKey) return res.status(500).json({ error: `API key not configured for ${source}` });
  
  try {
    const targetUrl = `${API_BASES[source]}${decodeURIComponent(url)}`;
    const headers = source === 'football-data' ? { 'X-Auth-Token': apiKey } : { 'x-apisports-key': apiKey };
    const response = await fetch(targetUrl, { headers });
    if (!response.ok) return res.status(response.status).json({ error: `API ${response.status}` });
    const data = await response.json();
    res.setHeader('Cache-Control', 's-maxage=300');
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
