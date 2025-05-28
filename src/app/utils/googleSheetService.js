import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

// New function to fetch and return trades
async function fetchTradesFromSheetLogic() {
  // Safely load credentials and validate environment
  const credentialsString = process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS;
  if (!credentialsString) throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_CREDENTIALS");

  let credentials;
  try {
    credentials = JSON.parse(credentialsString);
  } catch (parseErr) {
    throw new Error("Invalid JSON in GOOGLE_SERVICE_ACCOUNT_CREDENTIALS");
  }

  if (!credentials.client_email || !credentials.private_key) {
    throw new Error("Incomplete service account credentials (client_email or private_key missing)");
  }

  const sheetId = process.env.GOOGLE_SHEET_ID;
  const range = process.env.GOOGLE_SHEET_RANGE;
  if (!sheetId || !range) {
    throw new Error("Missing GOOGLE_SHEET_ID or GOOGLE_SHEET_RANGE env variables");
  }

  const auth = new JWT({
    email: credentials.client_email,
    key: credentials.private_key.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: range,
    valueRenderOption: 'FORMATTED_VALUE',
  });

  const rows = response.data.values;
  if (!rows || rows.length <= 1) {
    console.log('API /api/get-trades (from service): No data rows found in sheet.');
    return []; // Return empty array if no data
  }

  const headers = rows[0].map(header => String(header).trim());
  const colIndices = {
    Date: headers.indexOf('Date'),
    Direction: headers.indexOf('Direction'),
    Ticker: headers.indexOf('Ticker'),
    SPOT: headers.indexOf('SPOT'),
    FUTURES: headers.indexOf('FUTURES'),
    Status: headers.indexOf('Status'),
  };

  const cleanedTrades = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0 || row.every(cell => cell === null || String(cell).trim() === '')) {
      continue;
    }

    const rawDate = row[colIndices.Date];
    const date = new Date(rawDate);
    // Check if date is valid, if not, try to parse it differently or skip
    if (isNaN(date.getTime())) {
      // Attempt to parse dates like 'MM/DD/YYYY' which might not be parsed correctly by new Date() directly in all JS environments
      const parts = String(rawDate).split('/');
      if (parts.length === 3) {
        // Assuming MM/DD/YYYY
        const year = parseInt(parts[2], 10);
        const month = parseInt(parts[0], 10) - 1; // JS months are 0-indexed
        const day = parseInt(parts[1], 10);
        const parsedDate = new Date(year, month, day);
        if (!isNaN(parsedDate.getTime())) {
          date.setTime(parsedDate.getTime());
        } else {
          console.warn(`Skipping row with invalid date: ${rawDate}`);
          continue;
        }
      } else {
        console.warn(`Skipping row with invalid date: ${rawDate}`);
        continue;
      }
    }


    cleanedTrades.push({
      date: date.toISOString().split('T')[0],
      pnlPercentSpot: parseFloat(String(row[colIndices.SPOT]).replace('%','')) || 0.0,
      pnlPercentFutures: parseFloat(String(row[colIndices.FUTURES]).replace('%','')) || 0.0,
      ticker: row[colIndices.Ticker] || 'UNKNOWN',
      direction: row[colIndices.Direction] || 'N/A',
      status: row[colIndices.Status] || 'N/A',
    });
  }
  return cleanedTrades; // Return the processed data
}

// Export this new function with the name you want to import
export { fetchTradesFromSheetLogic as getTradesFromSheet };

// The original default handler can now use this logic if googleSheetService.js
// is also intended to be a standalone API endpoint.
// If not, you might not need this default export anymore here.
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=59');

  if (req.method === 'GET') {
    try {
      console.log("API (googleSheetService.js): Request received.");
      const trades = await fetchTradesFromSheetLogic(); // Use the new function
      console.log(`API (googleSheetService.js): Responding with ${trades.length} trades.`);
      return res.status(200).json(trades);
    } catch (error) {
      console.error("API (googleSheetService.js): Unhandled error in GET handler:", error);
      return res.status(500).json({
        error: 'Failed to process trade data request from service.',
        details: error?.message || 'Unknown error'
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}