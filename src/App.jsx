import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import { RockPaperScissors } from "./RockPaperScissors";
import { TicTacToe } from "./TicTacToe";
import { Pong } from "./Pong"; // Add import
//import { Sudoku } from "./Sudoku"; // Add import
import "./App.css";

function App() {
    return (
        <Router>
            <div className="App">
                <nav>
                    <Link to="/">Rock Paper Scissors</Link>
                    <Link to="/tictactoe">Tic Tac Toe</Link>
                    <Link to="/pong">Pong</Link>
                </nav>
                <Routes>
                    <Route path="/" element={<RockPaperScissors />} />
                    <Route path="/tictactoe" element={<TicTacToe />} />
                    <Route path="/pong" element={<Pong />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
