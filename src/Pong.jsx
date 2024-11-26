import React, { useState, useEffect, useRef } from "react";
import "./Pong.css";

export function Pong() {
	const canvasRef = useRef(null);
	const [leftScore, setLeftScore] = useState(0);
	const [rightScore, setRightScore] = useState(0);
	const rightPaddleY = useRef(150); // Use ref for AI paddle
	const [gameMode, setGameMode] = useState("Medium"); // Default mode

	const paddleWidth = 10;
	const paddleHeight = 100;
	const ballSize = 10;

	const ballX = useRef(300);
	const ballY = useRef(200);
	const ballSpeedX = useRef(5);
	const ballSpeedY = useRef(4);

	const aiSpeed = useRef(4);
	const ballSpeed = useRef(5);

	const mouseY = useRef(150);
	const leftPaddleSpeed = useRef(0);
	const lastMouseY = useRef(150);

	const hitSound = useRef(null);
	const scoreSound = useRef(null);

	// Function to play random SFX
	const playRandomizedSFX = (sound) => {
		const sfx = new Audio(sound);
		sfx.volume = Math.random() * 0.5 + 0.3; // Random volume between 0.5 and 1
		sfx.playbackRate = Math.random() * 0.5 + 1.1; // Random playback rate between 0.9 and 1.1
		sfx.play();
	};

	useEffect(() => {
		// Preload the sound files
		hitSound.current = [
			new Audio("src/assets/hitEffect1.wav"),
			new Audio("src/assets/hitEffect2.wav"),
		];
		scoreSound.current = new Audio("src/assets/hitEffect1.wav");

		// Cleanup function to stop and release resources when the component unmounts
		return () => {
			hitSound.current.forEach((sound) => {
				sound.pause();
				sound.setAttribute("src", ""); // Reset to free resources
			});
			scoreSound.current?.pause();
			scoreSound.current?.setAttribute("src", "");
		};
	}, []);

	// Play random hit sound effect when ball hits paddle or wall
	const playRandomHitSound = () => {
		const randomIndex = Math.floor(Math.random() * hitSound.current.length);
		playRandomizedSFX(hitSound.current[randomIndex].src); // Use the src of the randomly selected sound
	};

	// Handle mouse movement to move the left paddle
	const handleMouseMove = (e) => {
		const canvas = canvasRef.current;
		const mousePosY = e.clientY - canvas.getBoundingClientRect().top; // Mouse Y relative to canvas
		const speed = mouseY.current - lastMouseY.current; // Calculate vertical speed
		leftPaddleSpeed.current = speed; // Store vertical speed of paddle
		lastMouseY.current = mouseY.current; // Update last mouse position

		// Cap the paddle's movement to within the canvas
		const newY = Math.max(
			0,
			Math.min(
				mousePosY - paddleHeight / 2,
				canvas.height - paddleHeight,
			),
		);
		mouseY.current = newY;
	};

	// Move the AI paddle with a constant speed towards the ball
	const moveAIPaddle = () => {
		const adjustedAISpeed = aiSpeed.current * 1;
		if (ballY.current < rightPaddleY.current + paddleHeight / 2) {
			rightPaddleY.current = Math.max(
				0,
				rightPaddleY.current - adjustedAISpeed,
			);
		} else if (ballY.current > rightPaddleY.current + paddleHeight / 2) {
			rightPaddleY.current = Math.min(
				canvasRef.current.height - paddleHeight,
				rightPaddleY.current + adjustedAISpeed,
			);
		}
	};

	// Ball movement and collision detection
	const moveBall = () => {
		ballX.current += ballSpeedX.current;
		ballY.current += ballSpeedY.current;

		// Ball bouncing on top and bottom
		if (ballY.current <= 0 || ballY.current >= 400 - ballSize) {
			ballSpeedY.current = -ballSpeedY.current;
			playRandomHitSound();
		}

		// Ball bouncing on left paddle (use mouseY for left paddle)
		if (
			ballX.current <= paddleWidth + 7 &&
			ballY.current >= mouseY.current - 20 &&
			ballY.current <= mouseY.current + paddleHeight + 20
		) {
			ballSpeedX.current = -ballSpeedX.current;
			ballX.current = paddleWidth + 7;

			// Adjust ball's Y speed based on paddle's Y speed
			const paddleSpeedFactor = leftPaddleSpeed.current * 0.5;
			ballSpeedY.current += paddleSpeedFactor;

			playRandomHitSound();
		}

		// Ball bouncing on right paddle
		if (
			ballX.current >= 600 - paddleWidth - ballSize - 7 &&
			ballY.current >= rightPaddleY.current - 20 &&
			ballY.current <= rightPaddleY.current + paddleHeight + 20
		) {
			ballSpeedX.current = -ballSpeedX.current;
			ballX.current = 600 - paddleWidth - ballSize - 7;

			playRandomHitSound();
		}

		// Ball out of bounds (scoring)
		if (ballX.current <= 0) {
			setRightScore(rightScore + 1);
			playRandomizedSFX(scoreSound.current.src); // Play randomized score sound
			resetBall();
		} else if (ballX.current >= 600) {
			setLeftScore(leftScore + 1);
			playRandomizedSFX(scoreSound.current.src);
			resetBall();
		}
	};

	// Reset ball to the center after a score
	const resetBall = () => {
		ballX.current = 300;
		ballY.current = 200;
		ballSpeedX.current =
			ballSpeedX.current > 0 ? ballSpeed.current : -ballSpeed.current;
		ballSpeedY.current = ballSpeed.current;
	};

	// Handle game mode change
	const handleGameModeChange = (mode) => {
		setLeftScore(0);
		setRightScore(0);
		setGameMode(mode);
		switch (mode) {
			case "Easy":
				ballSpeed.current = 3;
				aiSpeed.current = 1;
				break;
			case "Medium":
				ballSpeed.current = 6;
				aiSpeed.current = 3;
				break;
			case "Hard":
				ballSpeed.current = 10;
				aiSpeed.current = 7;
				break;
			default:
				break;
		}
		resetBall();
	};

	useEffect(() => {
		// Add mouse move event listener to track mouse position
		window.addEventListener("mousemove", handleMouseMove);

		// Clean up the event listener when component is unmounted
		return () => window.removeEventListener("mousemove", handleMouseMove);
	}, []);

	useEffect(() => {
		const canvas = canvasRef.current;
		const context = canvas.getContext("2d");

		const gameInterval = setInterval(() => {
			context.clearRect(0, 0, canvas.width, canvas.height);

			// Draw paddles and ball
			context.fillStyle = "white";
			context.fillRect(0, mouseY.current, paddleWidth, paddleHeight);
			context.fillRect(
				590,
				rightPaddleY.current,
				paddleWidth,
				paddleHeight,
			);
			context.fillRect(ballX.current, ballY.current, ballSize, ballSize);

			// Move the ball and paddles
			moveBall();
			moveAIPaddle();

			context.font = "40px Arial"; // Set the font size to 40px
			context.fillText(leftScore, 100, 40, 100); // Adjust the position of the left score
			context.fillText(rightScore, 500, 40, 100); // Adjust the position of the right score
		}, 1000 / 60); // 60 FPS

		// Cleanup interval when the component unmounts
		return () => clearInterval(gameInterval);
	}, [leftScore, rightScore, mouseY.current, gameMode]);

	return (
		<div>
			<canvas
				ref={canvasRef}
				width="600"
				height="400"
				style={{ background: "black" }}
			/>
			<div>
				<h3>Game Mode: {gameMode}</h3>
				<button onClick={() => handleGameModeChange("Easy")}>
					Easy
				</button>
				<button onClick={() => handleGameModeChange("Medium")}>
					Medium
				</button>
				<button onClick={() => handleGameModeChange("Hard")}>
					Hard
				</button>
			</div>
			<div
				className="scoreboard"
				style={{
					position: "absolute",
					bottom: "10px",
					width: "100%",
					textAlign: "center",
				}}
			>
				<div>Left: {leftScore}</div>
				<div>Right: {rightScore}</div>
			</div>
		</div>
	);
}
