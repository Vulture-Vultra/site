import { getTradesFromSheet } from '@/app/utils/googleSheetService'; // This import should now work

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=59');

  if (req.method === 'GET') {
    try {
      console.log("API /api/get-trades: Request received.");

      const trades = await getTradesFromSheet(); // This will now call the refactored function

      if (!Array.isArray(trades)) {
        console.error("API /api/get-trades: Invalid data format from getTradesFromSheet");
        return res.status(500).json({ error: 'Unexpected data format from trade source.' });
      }

      console.log(`API /api/get-trades: Responding with ${trades.length} trades.`);
      return res.status(200).json(trades);

    } catch (error) {
      console.error("API /api/get-trades: Unhandled error in GET handler:", error);
      return res.status(500).json({
        error: 'Failed to process trade data request.',
        details: error?.message || 'Unknown error'
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}