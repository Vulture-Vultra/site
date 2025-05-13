const SheetDetails = require("../models/sheetDetails_model"); // Your Mongoose model
const XLSX = require("xlsx");



function excelDateToJSDate(serial) {
    const baseDate = new Date(1900, 0, 1);
    const excelEpochOffset = serial - 1;
    const jsDate = new Date(
        baseDate.getTime() + excelEpochOffset * 24 * 60 * 60 * 1000
    );
    return jsDate;
}

exports.postExcelFileData = async(req, res) => {
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
            const processedRow = {...row };
            for (const key in processedRow) {
                if (processedRow.hasOwnProperty(key)) {
                    const value = processedRow[key];
                    if (typeof value === "number" && value > 59) {
                        // Excel serial numbers for dates are typically greater than 59
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


exports.getPostExcelFileData = async(req, res) => {
    try {
        const getData = await SheetDetails.find();

        // Extract and concatenate all jsonData into a single array
        const concatenatedJsonData = getData.flatMap(sheet => sheet.jsonData);

        res.json(concatenatedJsonData);
        console.log(concatenatedJsonData);

    } catch (error) {
        console.error("Error getting excel file data:", error.message);
        res.status(500).json({ error: "Error getting excel file data:" });
    }
};


// Ensure this function exists in your controller
exports.getAllFilesWithIds = async(req, res) => {
    try {
        const files = await SheetDetails.find({}, "_id sheetName date jsonData");

        const responseData = files.map(file => ({
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
}



exports.deleteFileById = async(req, res) => {
    try {
        const { id } = req.params; // Get parent ID from URL
        const deletedFile = await SheetDetails.findByIdAndDelete(id);

        if (!deletedFile) {
            return res.status(404).json({ error: "File not found" });
        }

        res.json({ message: "File deleted successfully", id });
    } catch (error) {
        console.error("Error deleting file:", error.message);
        res.status(500).json({ error: "Error deleting file" });
    }
};