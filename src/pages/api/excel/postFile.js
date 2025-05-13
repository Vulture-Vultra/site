import multer from "multer";
import XLSX from "xlsx";
import connectDb from "../../../app/backend/DB/db";
import SheetDetails from "../../../app/backend/models/sheetDetails_model";

const upload = multer({ storage: multer.memoryStorage() });

export const config = {
  api: {
    bodyParser: false, // Disable Next.js default body parser
  },
};

const handler = async (req, res) => {
  await new Promise((resolve, reject) => {
    upload.single("file")(req, res, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });

  await connectDb(); // Ensure database connection

  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const fileName = req.file.originalname;

  try {
    // Parse the uploaded Excel file
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert the sheet data to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false });

    // Process JSON data to convert Excel dates to JS dates
    const processedData = jsonData.map((row) => {
      const processedRow = { ...row };
      for (const key in processedRow) {
        if (processedRow.hasOwnProperty(key)) {
          const value = processedRow[key];
          if (typeof value === "number" && value > 59) {
            processedRow[key] = excelDateToJSDate(value);
          }
        }
      }
      return processedRow;
    });

    // Create a new instance of the SheetDetails model
    const sheetsData = new SheetDetails({
      sheetName: fileName,
      date: new Date(),
      jsonData: processedData,
    });

    await sheetsData.save();

    // Send a success response with the saved data
    res.json({
      message: "Data saved successfully",
      data: sheetsData,
    });
  } catch (error) {
    console.error("Error processing the Excel file:", error.message);
    res.status(500).json({ error: "Error processing the Excel file" });
  }
};

export default handler;

function excelDateToJSDate(serial) {
  const baseDate = new Date(1900, 0, 1);
  const excelEpochOffset = serial - 1;
  const jsDate = new Date(
    baseDate.getTime() + excelEpochOffset * 24 * 60 * 60 * 1000
  );
  return jsDate;
}