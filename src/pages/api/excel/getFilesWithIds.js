import connectDb from "../../../app/backend/DB/db";
import SheetDetails from "../../../app/backend/models/sheetDetails_model";

export default async function handler(req, res) {
  await connectDb(); // Ensure database connection

  if (req.method === "GET") {
    try {
      const files = await SheetDetails.find({}, "_id sheetName date jsonData");

      const responseData = files.map((file) => ({
        id: file._id,
        sheetName: file.sheetName,
        date: file.date,
        jsonData: file.jsonData,
      }));

      res.json(responseData);
    } catch (error) {
      console.error("Error fetching files with IDs:", error.message);
      res.status(500).json({ error: "Error fetching files" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}