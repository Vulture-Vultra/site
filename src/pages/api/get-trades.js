// src/pages/api/get-trades.js
import { getTradesFromSheet } from '@/app/utils/googleSheetService';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=59');

  if (req.method === 'GET') {
    try {
      console.log("API /api/get-trades: Request received.");
      const trades = await getTradesFromSheet(); // Will be an array

      console.log(`API /api/get-trades: Responding with ${trades.length} trades.`);
      return res.status(200).json(trades);

    } catch (error) {
      console.error("API /api/get-trades: Unhandled error in GET handler:", error);
      return res.status(500).json({ error: 'Failed to process trade data request.' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}