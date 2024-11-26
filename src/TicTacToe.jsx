import React, { useState } from "react";
import "./TicTacToe.css"; // Add styling here

export function TicTacToe() {
	const [board, setBoard] = useState(Array(9).fill(null));
	const [isXNext, setIsXNext] = useState(true);
	const winnerInfo = calculateWinner(board); // Get winner and winning line
	const isDraw = !winnerInfo.winner && board.every((cell) => cell !== null);

	const handleClick = (index) => {
		if (board[index] || winnerInfo.winner || isDraw) return;
		const newBoard = board.slice();
		newBoard[index] = isXNext ? "X" : "O";
		setBoard(newBoard);
		setIsXNext(!isXNext);
	};

	const restartGame = () => {
		setBoard(Array(9).fill(null));
		setIsXNext(true);
	};

	return (
		<div>
			<h1>Tic Tac Toe</h1>
			<div className="board">
				{board.map((cell, index) => (
					<div
						className={`cell ${
							winnerInfo.winningLine?.includes(index)
								? cell === "X"
									? "winning-cell-x"
									: "winning-cell-o"
								: ""
						}`}
						key={index}
						onClick={() => handleClick(index)}
						style={{
							color:
								cell === "X"
									? "red"
									: cell === "O"
										? "blue"
										: "inherit",
						}}
					>
						{cell}
					</div>
				))}
			</div>
			<div
				className="status"
				style={{
					color:
						winnerInfo.winner === "X"
							? "red"
							: winnerInfo.winner === "O"
								? "blue"
								: "inherit",
				}}
			>
				{winnerInfo.winner
					? `Winner: ${winnerInfo.winner}`
					: isDraw
						? "It's a draw!"
						: `Next Player: ${isXNext ? "X" : "O"}`}
			</div>
			<button className="button" onClick={restartGame}>
				Restart
			</button>
		</div>
	);
}

function calculateWinner(board) {
	const lines = [
		[0, 1, 2],
		[3, 4, 5],
		[6, 7, 8],
		[0, 3, 6],
		[1, 4, 7],
		[2, 5, 8],
		[0, 4, 8],
		[2, 4, 6],
	];
	for (let line of lines) {
		const [a, b, c] = line;
		if (board[a] && board[a] === board[b] && board[a] === board[c]) {
			return { winner: board[a], winningLine: line }; // Return winner and winning cells
		}
	}
	return { winner: null, winningLine: null };
}
