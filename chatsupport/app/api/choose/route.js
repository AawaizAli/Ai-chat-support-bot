const fs = require('fs');
const path = require('path');

export default function handler(req, res) {
    if (req.method !== 'GET') {
        // Only allow GET requests
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }

    console.log("API called to load model parameters...");

    try {
        // Determine the path to the JSON file
        const modelPath = path.resolve(process.cwd(), './chatsupport/app/classification_model/naive_bayes_model.json');
        console.log(`Loading model from: ${modelPath}`);

        // Check if the file exists
        if (!fs.existsSync(modelPath)) {
            console.error("Error: Model file does not exist at the specified path.");
            return res.status(404).json({ error: "Model file not found" });
        }

        // Read the JSON file
        const modelData = fs.readFileSync(modelPath, 'utf8');
        
        // Parse the JSON data
        try {
            const modelParams = JSON.parse(modelData);
            console.log("Model successfully loaded.");

            // Return the model parameters as JSON
            return res.status(200).json(modelParams);
        } catch (parseError) {
            console.error("Error parsing the JSON model file:", parseError);
            return res.status(500).json({ error: "Failed to parse the model JSON file" });
        }
    } catch (error) {
        console.error("Error during model loading:", error);
        return res.status(500).json({ error: "Model loading failed" });
    }
}
