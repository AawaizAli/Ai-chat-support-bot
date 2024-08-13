const natural = require('natural');
const classifier = new natural.BayesClassifier();

// Train the classifier with your dataset
classifier.addDocument('What are the latest fashion trends for 2024?', 'fashion');
classifier.addDocument('How can I improve my bench press strength?', 'fitness');
classifier.addDocument('Explain the Pythagorean theorem.', 'studies');
// Add more training data...

classifier.train();

// Save the trained model to a file
classifier.save('naive_bayes_classifier.json', function(err, classifier) {
    if (err) {
        console.error('Error saving classifier:', err);
    } else {
        console.log('Classifier saved successfully.');
    }
});

// Load the model when you need it in your API
natural.BayesClassifier.load('naive_bayes_classifier.json', null, function(err, classifier) {
    if (err) {
        console.error('Error loading classifier:', err);
    } else {
        const classification = classifier.classify('How do I increase my stamina?');
        console.log('Classification:', classification);
    }
});
