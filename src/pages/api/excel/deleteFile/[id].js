import connectDb from "../../../../app/backend/DB/db";
import SheetDetails from "../../../../app/backend/models/sheetDetails_model";

export default async function handler(req, res) {
  await connectDb(); // Ensure database connection

  if (req.method === "DELETE") {
    try {
      const { id } = req.query; // Get document ID from URL
      const deletedFile = await SheetDetails.findByIdAndDelete(id);

      if (!deletedFile) {
        return res.status(404).json({ error: "File not found" });
      }

      res.json({ message: "File deleted successfully", id });
    } catch (error) {
      console.error("Error deleting file:", error.message);
      res.status(500).json({ error: "Error deleting file" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}