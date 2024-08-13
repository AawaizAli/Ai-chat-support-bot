import fs from 'fs';
import path from 'path';

console.log("Starting model loading...");

// Load the model parameters from the JSON file
let modelParams;
try {
    const modelPath = path.resolve(process.cwd(), './chatsupport/app/api/classify/naive_bayes_model.json');
    console.log(`Loading model from: ${modelPath}`);
    
    const modelData = fs.readFileSync(modelPath, 'utf8');
    modelParams = JSON.parse(modelData);
    
    console.log("Model successfully loaded.");
} catch (error) {
    console.error("Error loading the model:", error);
    throw new Error("Model loading failed");
}

function predict(prompt) {
    console.log(`Received prompt: "${prompt}"`);

    const tokens = prompt.split(/\s+/);
    console.log("Tokens:", tokens);

    const vector = new Array(Object.keys(modelParams.vocabulary_).length).fill(0);
    console.log("Initial vector:", vector);

    tokens.forEach(token => {
        const index = modelParams.vocabulary_[token];
        if (index !== undefined) {
            vector[index] += 1;
        }
    });

    console.log("Vector after processing tokens:", vector);

    const logProbs = modelParams.classes_.map((_, classIndex) => {
        const logProb = modelParams.class_log_prior_[classIndex] + vector.reduce((sum, value, i) => {
            return sum + (value * modelParams.feature_log_prob_[classIndex][i]);
        }, 0);
        console.log(`Log probability for class "${modelParams.classes_[classIndex]}": ${logProb}`);
        return logProb;
    });

    const maxIndex = logProbs.indexOf(Math.max(...logProbs));
    console.log("Predicted class index:", maxIndex);
    console.log("Predicted class:", modelParams.classes_[maxIndex]);

    return modelParams.classes_[maxIndex];
}

export default async function handler(req, res) {
    console.log("Handler triggered.");

    if (req.method === 'POST') {
        const { prompt } = req.body;
        console.log("Prompt received in handler:", prompt);

        try {
            const label = predict(prompt);
            console.log("Predicted label:", label);

            res.status(200).json({ label });
        } catch (error) {
            console.error("Error during prediction:", error);
            res.status(500).json({ error: "Prediction failed" });
        }
    } else {
        console.log("Invalid method received:", req.method);
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

// Test the model with a dummy prompt
const testPrompt = 'What is 2 times 2?';
const testLabel = predict(testPrompt);
console.log(`Test prompt: "${testPrompt}"`);
console.log(`Predicted label: ${testLabel}`);
