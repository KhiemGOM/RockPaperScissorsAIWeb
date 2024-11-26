import React, { useState, useEffect } from 'react';
import { getAIMove, retrainAIMove } from './AIBackend.jsx';

export function RockPaperScissors() {
	const [result, setResult] = useState('');
	const [moveSequence, setMoveSequence] = useState([]);
	const [playerWins, setPlayerWins] = useState(0);
	const [aiWins, setAiWins] = useState(0);
	const [draws, setDraws] = useState(0);
	const [totalGames, setTotalGames] = useState(0);
	const [winRate, setWinRate] = useState(0);
	const [isLoading, setIsLoading] = useState(false);

	const determineResult = (userMove, aiMove) => {
		if (userMove === aiMove) {
			setDraws(prev => prev + 1);
			return 'It\'s a draw!';
		}

		const winningMoves = {
			rock: 'scissors',
			paper: 'rock',
			scissors: 'paper',
		};

		if (winningMoves[userMove] === aiMove) {
			setPlayerWins(prev => prev + 1);
			return 'You win!';
		} else {
			setAiWins(prev => prev + 1);
			return 'AI wins!';
		}
	};

	useEffect(() => {
		if (totalGames > 0) {
			setWinRate(((playerWins / totalGames) * 100).toFixed(2));
		}
	}, [playerWins, totalGames]);

	const makeMove = async (userMove) => {
		setIsLoading(true);
		setTimeout(async () => {
			const aiMove = await getAIMove(moveSequence);
			const winningMove = { rock: 'paper', paper: 'scissors', scissors: 'rock' }[aiMove];
			setResult(`AI picked: ${winningMove}`);
			const gameResult = determineResult(userMove, winningMove);
			setResult(prev => `${prev} - ${gameResult}`);
			const newMoveSequence = [...moveSequence, userMove];
			setMoveSequence(newMoveSequence);
			setTotalGames(prev => prev + 1);
			await retrainAIMove(moveSequence, userMove);
			setIsLoading(false);
		}, 0);
	};

	return (
		<div>
			<h1>Rock Paper Scissors</h1>
			<div>
				<button className="button" onClick={() => makeMove('rock')} disabled={isLoading}>Rock</button>
				<button className="button" onClick={() => makeMove('paper')} disabled={isLoading}>Paper</button>
				<button className="button" onClick={() => makeMove('scissors')} disabled={isLoading}>Scissors</button>
			</div>
			<div className="status">{isLoading ? "Loading..." : result}</div>
			<div className="stats">
				<p>Wins: {playerWins}</p>
				<p>AI Wins: {aiWins}</p>
				<p>Draws: {draws}</p>
				<p>Total Games: {totalGames}</p>
				<p>Win Rate: {winRate}%</p>
			</div>
		</div>
	);
}
