import * as tf from '@tensorflow/tfjs';

// One-hot encode move (rock = 0, paper = 1, scissors = 2)
function oneHotEncodeMove(move) {
    switch (move) {
        case 'rock':
            return [1, 0, 0]; // Numeric encoding
        case 'paper':
            return [0, 1, 0];
        case 'scissors':
            return [0, 0, 1];
        default:
            throw new Error('Invalid move');
    }
}


// Fallback for random move (when the model can't make a prediction)
function getRandomMove() {
    const moves = ['rock', 'paper', 'scissors'];
    return moves[Math.floor(Math.random() * moves.length)];
}

// TensorFlow.js version of the RPS model (simplified RNN)
class RPSRNN {
    constructor(windowSize) {
        this.model = this.buildModel()
        this.windowSize = windowSize;
    }

    buildModel() {
        const model = tf.sequential();

        // Add the first RNN layer with 'windowSize' timesteps and 3 features
        model.add(tf.layers.simpleRNN({
            units: 32, // Can adjust this based on performance
            inputShape: [this.windowSize, 3], // `windowSize` timesteps, 3 features (one-hot for rock/paper/scissors)
            returnSequences: true, // Return sequences for the next RNN layer
            dropout: 0
        }));

        // Add the second RNN layer
        model.add(tf.layers.simpleRNN({
            units: 32, // Same number of units
            returnSequences: false, // Last layer should not return sequences
            dropout: 0
        }));

        // Add output layer with 3 units (rock, paper, scissors), softmax activation for probabilities
        model.add(tf.layers.dense({units: 8, activation: 'relu'}));
        model.add(tf.layers.dense({units: 3, activation: 'softmax'}));

        // Compile the model with a loss function and optimizer
        const learningRate = 5e-2; // Change this to your desired learning rate
        const optimizer = tf.train.adam(learningRate); // Create Adam optimizer with specified learning rate
        model.compile({
            loss: 'categoricalCrossentropy',
            optimizer: optimizer,
            metrics: ['accuracy'],
        });

        return model;
    }

    // Predict the AI's next move based on user history
    async predict(moveSequence) {
        // Check if we have enough moves to make a prediction, otherwise AI will pick randomly
        if (moveSequence.length < this.windowSize) {
            return getRandomMove(); // Random move since we don't have enough history yet
        }
        // Get the last `windowSize` moves, or less if not enough moves
        const inputMoves = moveSequence.slice(-this.windowSize);
        //console.log("Input moves", inputMoves)
        // If `inputMoves` is not an array, default it to an empty array

        const oneHotEncodedMoves = (inputMoves.length > 0)
            ? inputMoves.map(move => oneHotEncodeMove(move))
            : [];

        // Reshape the input into [1, timesteps, features] as expected by RNN
        const reshapedInput = tf.tensor3d([oneHotEncodedMoves], [1, this.windowSize, 3]);
        //console.log("Input: ", inputMoves)
        // Make prediction
        const prediction = this.model.predict(reshapedInput);
        const predictedMoveIndex = prediction.argMax(-1).dataSync()[0];

        const predictedMove = ["rock", "paper", "scissors"][predictedMoveIndex];

        //console.log("Predicted Move: ", predictedMove);
        return predictedMove; // Return the move as a string
    }


    // Retrain the AI model with the latest move sequence
    async retrain(moveSequence, userMove) {
        // Ensure we have enough moves in the sequence for training
        if (moveSequence.length < this.windowSize) {
            //console.log(`Not enough data for training of window size: ${this.windowSize}. Skipping this step.`);
            return;
        }

        // Use the last `windowSize` moves from the sequence
        const inputMoves = moveSequence.slice(-this.windowSize);
        const oneHotEncodedMoves = inputMoves.map(move => oneHotEncodeMove(move));

        // Reshape the input into [1, timesteps, features] (1 batch, windowSize timesteps, 3 features)

        const reshapedInput = this.windowSize === 1
            ? tf.tensor3d([oneHotEncodedMoves], [1, 1, 3]) // Shape for windowSize 1
            : tf.tensor3d([oneHotEncodedMoves], [1, this.windowSize, 3]); // General case
        const targetTensor = tf.tensor2d([oneHotEncodeMove(userMove)], [1, 3]);

        try {
            await this.model.fit(reshapedInput, targetTensor, {
                epochs: 1, // Single epoch to ensure quick on-the-fly retraining
                verbose: 0, // Suppress training logs
            });
        } catch (err) {
            console.log("fuck: ", err)
        }
        // One-hot encode the user's move
        // Perform training on a single batch

        //console.log("Retraining completed on the last window of moves.");
    }


}

const windowSizes = [3, 5, 10, 20, 50, 100]; // Can add more window sizes like 20, 50, 100
const rnns = windowSizes.map((windowSize) => new RPSRNN(windowSize)); // Input size 3 (rock/paper/scissors), hidden size 24, output size 3 (three moves)

// Function to get a random AI move if not enough moves are available for inference
function getRandomAIMove() {
    const randomIndex = Math.floor(Math.random() * 3);
    return ["rock", "paper", "scissors"][randomIndex];

}
// Initialize multiple RNNs with different window sizes (ensemble)

// Function to get the AI's move based on ensemble predictions (handling different window sizes)
async function getAIMove(moveSequence) {
    const validPredictions = [];

    // Iterate over each RNN in the ensemble
    await Promise.all(
        rnns.map(async (rnn) => {
            const windowSize = rnn.windowSize; // Get the window size for this model

            // If the game history isn't long enough, skip inference but still train
            if (moveSequence.length < windowSize) {
                return; // Skip inference for this model
            }

            const prediction = oneHotEncodeMove(await rnn.predict(moveSequence));
            //console.log(`Prediction from ${windowSize} AI: `, prediction)
            validPredictions.push(prediction); // Store the valid prediction
        })
    );

    // If no valid models were used (i.e., too few moves), return a random AI move
    if (validPredictions.length === 0) {
        return getRandomAIMove(); // Random choice for the first moves
    }
    // Combine valid predictions by averaging
    const averagedPredictions = tf.mean(validPredictions, 0);


    // Pick the move with the highest probability
    const aiMoveIndex = averagedPredictions.argMax(-1).dataSync()[0];

    // Return AI move as "rock", "paper", or "scissors"
    return ["rock", "paper", "scissors"][aiMoveIndex];
}

// Function to retrain the ensemble after each move (always retrain regardless of window size)
async function retrainAIMove(moveSequence, actualMove) {
    //console.log(actualMove)
    // Retrain each RNN in the ensemble
    await Promise.all(
        rnns.map(async (rnn) => {
            await rnn.retrain(moveSequence, actualMove);
        })
    );
}

export {getAIMove, retrainAIMove};