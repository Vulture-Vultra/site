// src/app/utils/googleSheetService.js
import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

function safeFloatPercent(valueStr) {
    if (valueStr === null || valueStr === undefined || String(valueStr).trim() === "" || 
        String(valueStr).toUpperCase() === "#NAME?" || 
        String(valueStr).toUpperCase() === "#VALUE!" || 
        String(valueStr).toUpperCase() === "#N/A") {
        return null;
    }
    try {
        const s = String(valueStr).replace('%', '').trim();
        const num = parseFloat(s);
        return isNaN(num) ? null : num;
    } catch (error) {
        // console.warn(`safeFloatPercent: Could not convert '${valueStr}' to float.`);
        return null;
    }
}

function parseDate(dateInput) {
    if (!dateInput) return null;
    let date = new Date(dateInput);
    if (!isNaN(date.getTime())) return date;

    if (typeof dateInput === 'number' && dateInput > 25569 && dateInput < 60000) {
        const utc_days = Math.floor(dateInput - 25569);
        const excelDate = new Date(Date.UTC(0, 0, utc_days));
        if (!isNaN(excelDate.getTime())) return excelDate;
    }
    if (typeof dateInput === 'string') {
        const parts = dateInput.match(/(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{2,4})/);
        if (parts) {
            const year = parseInt(parts[3], 10);
            const month = parseInt(parts[1], 10) - 1;
            const day = parseInt(parts[2], 10);
            const formattedYear = year < 100 ? (year > 50 ? 1900 + year : 2000 + year) : year;
            date = new Date(formattedYear, month, day);
            if (!isNaN(date.getTime())) return date;
        }
    }
    // console.warn(`parseDate: Could not parse date '${dateInput}'`);
    return null;
}

function getStringValue(cellValue, defaultValue = "N/A") {
    if (cellValue !== null && cellValue !== undefined) {
        const trimmedValue = String(cellValue).trim();
        if (trimmedValue !== "" && trimmedValue.toUpperCase() !== "N/A" && 
            trimmedValue.toUpperCase() !== "UNDEFINED" && !trimmedValue.startsWith("#")) {
            return trimmedValue;
        }
    }
    return defaultValue;
}

export async function getTradesFromSheet() {
    console.log("getTradesFromSheet: Service invoked.");
    try {
        const credentialsString = process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS;
        if (!credentialsString) {
            console.error("getTradesFromSheet: GOOGLE_SERVICE_ACCOUNT_CREDENTIALS env var not set.");
            return [];
        }
        const credentials = JSON.parse(credentialsString);
        const sheetId = process.env.GOOGLE_SHEET_ID;
        const range = process.env.GOOGLE_SHEET_RANGE; // Expected: "Compiled!A:J" to include Status

        if (!sheetId || !range) {
            console.error("getTradesFromSheet: GOOGLE_SHEET_ID or GOOGLE_SHEET_RANGE env var not set.");
            return [];
        }

        const auth = new JWT({
            email: credentials.client_email,
            key: credentials.private_key.replace(/\\n/g, '\n'),
            scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        });

        const sheets = google.sheets({ version: 'v4', auth });
        console.log(`getTradesFromSheet: Fetching from Sheet ID: ${sheetId}, Range: ${range}`);
        
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: range,
            valueRenderOption: 'FORMATTED_VALUE' 
        });

        const rows = response.data.values;
        if (!rows || rows.length <= 1) { 
            console.log('getTradesFromSheet: No data rows found in sheet.'); return [];
        }

        const headers = rows[0].map(header => String(header).trim());
        console.log("getTradesFromSheet: Detected Headers:", headers); // For debugging header names
        const colIndices = {
            Date: headers.indexOf('Date'), Direction: headers.indexOf('Direction'),
            Ticker: headers.indexOf('Ticker'), SPOT: headers.indexOf('SPOT'),
            FUTURES: headers.indexOf('FUTURES'), Status: headers.indexOf('Status')
        };

        if ([colIndices.Date, colIndices.Direction, colIndices.Ticker].some(idx => idx === -1)) {
             console.error(`getTradesFromSheet: Essential headers (Date, Direction, Ticker) missing. Found: ${headers.join(',')}`); return [];
        }
        if (colIndices.SPOT === -1) console.warn("getTradesFromSheet: 'SPOT' column header not found. Spot PnL values will be 0.");
        if (colIndices.FUTURES === -1) console.warn("getTradesFromSheet: 'FUTURES' column header not found. Futures PnL values will be 0.");
        if (colIndices.Status === -1) console.warn("getTradesFromSheet: 'Status' column header not found. Status will default to N/A.");


        const cleanedTrades = [];
        let skippedRowsCount = 0;
        console.log(`getTradesFromSheet: Processing ${rows.length - 1} data rows...`);

        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (!row || row.length === 0 || row.every(cell => cell === null || String(cell).trim() === '')) {
                skippedRowsCount++; continue;
            }

            const parsedDate = parseDate(row[colIndices.Date]);
            if (!parsedDate) {
                skippedRowsCount++; continue;
            }
            const dateStr = `${(parsedDate.getMonth() + 1).toString().padStart(2, '0')}/${parsedDate.getDate().toString().padStart(2, '0')}/${parsedDate.getFullYear()}`;

            const direction = getStringValue(row[colIndices.Direction], null);
            const ticker = getStringValue(row[colIndices.Ticker], 'UNKNOWN');
            
            if (!direction) {
                skippedRowsCount++; continue;
            }

            const pnlPercentSpot = colIndices.SPOT !== -1 ? (safeFloatPercent(row[colIndices.SPOT]) || 0.0) : 0.0;
            const pnlPercentFutures = colIndices.FUTURES !== -1 ? (safeFloatPercent(row[colIndices.FUTURES]) || 0.0) : 0.0;
            const status = colIndices.Status !== -1 ? getStringValue(row[colIndices.Status], 'N/A') : 'N/A';
            
            cleanedTrades.push({
                date: dateStr,
                pnlPercentSpot: parseFloat(pnlPercentSpot.toFixed(4)),
                pnlPercentFutures: parseFloat(pnlPercentFutures.toFixed(4)),
                ticker: ticker,
                direction: direction,
                status: status,
            });
        }

        cleanedTrades.sort((a, b) => new Date(a.date) - new Date(b.date));
        console.log(`getTradesFromSheet: Finished processing. Cleaned trades: ${cleanedTrades.length}, Skipped: ${skippedRowsCount}`);
        return cleanedTrades;

    } catch (err) {
        console.error('getTradesFromSheet: Error during execution:', err.message);
        if (err.code) console.error('Error Code:', err.code);
        if (err.errors) console.error('Google API Errors:', err.errors);
        return [];
    }
}