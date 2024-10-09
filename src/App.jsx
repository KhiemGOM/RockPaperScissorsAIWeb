import { useState, useEffect } from 'react';
import './App.css';

import { getAIMove, retrainAIMove } from './AIBackend.jsx'; // Your custom AI logic file

function App() {
    const [result, setResult] = useState('');  // State for AI's move
    const [moveSequence, setMoveSequence] = useState([]); // Array to store move history
    const [playerWins, setPlayerWins] = useState(0); // Player win count
    const [aiWins, setAiWins] = useState(0); // AI win count
    const [draws, setDraws] = useState(0); // Draw count
    const [totalGames, setTotalGames] = useState(0); // Total games played
    const [winRate, setWinRate] = useState(0); // Player win rate
    const [isLoading, setIsLoading] = useState(false); // Loading state

    // Function to determine result based on player's move and AI's predicted move
    const determineResult = (userMove, aiMove) => {
        if (userMove === aiMove) {
            setDraws(prev => prev + 1);
            return 'It\'s a draw!';
        }

        const winningMoves = {
            rock: 'scissors',
            paper: 'rock',
            scissors: 'paper'
        };

        if (winningMoves[userMove] === aiMove) {
            setPlayerWins(prev => prev + 1);
            return 'You win!';
        } else {
            setAiWins(prev => prev + 1);
            return 'AI wins!';
        }
    };

    // Function to update win rate
    useEffect(() => {
        if (totalGames > 0) {
            setWinRate(((playerWins / totalGames) * 100).toFixed(2)); // Win rate as percentage
        }
    }, [playerWins, totalGames]);

    // Function to handle move selection
    const makeMove = async (userMove) => {
        setIsLoading(true); // Start loading

        // Simulate async behavior with setTimeout
        setTimeout(async () => {
            const aiMove = await getAIMove(moveSequence);  // Get AI move
            const winningMove = {
                rock: 'paper',
                paper: 'scissors',
                scissors: 'rock'
            }[aiMove]; // Invert AI's move to the winning one

            setResult(`AI picked: ${winningMove}`);  // Show AI's move
            const gameResult = determineResult(userMove, winningMove); // Determine the result
            setResult(prev => `${prev} - ${gameResult}`); // Update result with game result

            const newMoveSequence = [...moveSequence, userMove];  // Update move sequence
            setMoveSequence(newMoveSequence);

            setTotalGames(prev => prev + 1); // Update total games played
            await retrainAIMove(moveSequence, userMove);  // Retrain AI

            setIsLoading(false); // End loading
        }, 0); // Use 0 to push it to the end of the event queue
    };

    // Determine the status color based on the result
    const statusColor = result.includes('You win!') ? 'green' : result.includes('AI wins!') ? 'red' : 'orange';

    return (
        <div className="App">
            <h1>Rock Paper Scissors with AI</h1>

            <button className="button" onClick={() => makeMove('rock')} disabled={isLoading}>Rock</button>
            <button className="button" onClick={() => makeMove('paper')} disabled={isLoading}>Paper</button>
            <button className="button" onClick={() => makeMove('scissors')} disabled={isLoading}>Scissors</button>

            <div id="result" style={{color: isLoading? "white" : statusColor, fontSize: 30, fontWeight: 'bold', paddingTop: "20px"}}>{isLoading? "Loading..." : result}</div>
            <div className="stats" style={{fontSize: 20}}>
                <h2>Player Statistics</h2>
                <p>Wins: {playerWins}</p>
                <p>AI Wins: {aiWins}</p>
                <p>Draws: {draws}</p>
                <p>Total Games: {totalGames}</p>
                <p>Win Rate: {winRate}%</p>
            </div>

        </div>
    );
}

export default App;