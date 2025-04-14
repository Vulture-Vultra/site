import connectDb from "../../../app/backend/DB/db";
import SheetDetails from "../../../app/backend/models/sheetDetails_model";

export default async function handler(req, res) {
  await connectDb(); // Ensure database connection

  if (req.method === "GET") {
    try {
      const getData = await SheetDetails.find();

      // Extract and concatenate all jsonData into a single array
      const concatenatedJsonData = getData.flatMap((sheet) => sheet.jsonData);

      res.json(concatenatedJsonData);
      console.log(concatenatedJsonData);
    } catch (error) {
      console.error("Error getting Excel file data:", error.message);
      res.status(500).json({ error: "Error getting Excel file data" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}