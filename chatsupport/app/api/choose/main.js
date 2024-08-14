const fs = require('fs');
const path = require('path');

// Define the path to the original JSON file
const modelPath = path.resolve('./chatsupport/app/classification_model/naive_bayes_model.json');

// Define the path where you want to save the new JSON file
const savePath = path.resolve('./saved_naive_bayes_model.json');

// Function to read and save the JSON file
function saveJsonFile() {
    try {
        // Read the JSON file
        const modelData = fs.readFileSync(modelPath, 'utf8');

        // Save the JSON data to the new file
        fs.writeFileSync(savePath, modelData);

        console.log(`JSON file successfully saved to: ${savePath}`);
    } catch (error) {
        console.error('Error during file operation:', error);
    }
}

// Run the function
saveJsonFile();
