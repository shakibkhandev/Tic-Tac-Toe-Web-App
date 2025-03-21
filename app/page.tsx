'use client'
import {
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { SignedIn } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
  }, []);

  // Add computer move effect
  useEffect(() => {
    if (!isXNext && !winner) {
      const timeoutId = setTimeout(makeComputerMove, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [isXNext, winner, board]);

  const toggleTheme = () => setIsDark(!isDark);

  const calculateWinner = (squares : any) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];

    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const makeComputerMove = () => {
    const availableSquares = board.reduce((acc, square, index) => {
      if (!square) acc.push(index);
      return acc;
    }, []);

    if (availableSquares.length > 0) {
      // Try to win
      for (const index of availableSquares) {
        const testBoard = [...board];
        testBoard[index] = "O";
        if (calculateWinner(testBoard) === "O") {
          handleMove(index);
          return;
        }
      }

      // Block player's winning move
      for (const index of availableSquares) {
        const testBoard = [...board];
        testBoard[index] = "X";
        if (calculateWinner(testBoard) === "X") {
          handleMove(index);
          return;
        }
      }

      // Try to take center
      if (availableSquares.includes(4)) {
        handleMove(4);
        return;
      }

      // Take random available square
      const randomIndex = availableSquares[Math.floor(Math.random() * availableSquares.length)];
      handleMove(randomIndex);
    }
  };

  interface BoardProps {
    board: (string | null)[];
    isXNext: boolean;
    winner: string | null;
  }

  interface SquareProps {
    value: string | null;
    onClick: () => void;
  }

  const handleMove = (index: number) => {
    if (board[index] || winner) return;

    const newBoard: (string | null)[] = [...board];
    newBoard[index] = isXNext ? "X" : "O";
    setBoard(newBoard);
    setIsXNext(!isXNext);

    const gameWinner: string | null = calculateWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
    }
  };

  interface HandleClickProps {
    index: number;
  }

  const handleClick = (index: HandleClickProps['index']) => {
    if (isXNext && !board[index] && !winner) {
      handleMove(index);
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
  };

  const Square = ({ value, onClick }: SquareProps) => (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`w-24 h-24 rounded-xl shadow-lg text-5xl font-bold flex items-center justify-center
        ${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-800 border-gray-200'}
        border transition-colors duration-300`}
      onClick={onClick}
    >
      <AnimatePresence>
        {value && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ duration: 0.2 }}
            className={value === 'X' ? 'text-blue-500' : 'text-purple-500'}
          >
            {value}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );

  const status = winner
    ? `Winner: ${winner}`
    : board.every(square => square !== null)
    ? "Draw!"
    : `Next player: ${isXNext ? "X (You)" : "O (Computer)"}`;

  return (
    <main className={`min-h-screen transition-colors duration-300 
      ${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50'}`}>
      <header className="flex justify-between items-center p-4">
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-lg ${isDark ? 'bg-gray-800 text-yellow-400' : 'bg-indigo-100 text-gray-800'}`}
        >
          {isDark ? '🌙' : '☀️'}
        </button>
        <div className="flex gap-4">
          <SignedOut>
            <div className={`px-4 py-2 rounded-lg transition-colors
              ${isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-indigo-600 hover:bg-indigo-700'}
              text-white`}>
              <SignInButton />
            </div>
            <div className={`px-4 py-2 rounded-lg transition-colors
              ${isDark ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-600 hover:bg-purple-700'}
              text-white`}>
              <SignUpButton />
            </div>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]"
      >
        <h1 className={`text-5xl font-bold mb-8 ${isDark ? 'text-white' : 'text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600'}`}>
          Tic Tac Toe vs Computer
        </h1>

        <SignedIn>
          <motion.div
            className={`backdrop-blur-sm p-8 rounded-2xl shadow-2xl
              ${isDark ? 'bg-gray-800/50' : 'bg-white/80'}`}
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className={`mb-6 text-2xl font-medium
                ${isDark ? 'text-gray-200' : 'text-gray-700'}`}
              animate={{ 
                color: winner ? (isDark ? '#34D399' : '#10B981') : (isDark ? '#D1D5DB' : '#6B7280'),
                transition: { duration: 0.3 }
              }}
            >
              {status}
            </motion.div>

            <div className="grid grid-cols-3 gap-4">
              {board.map((square, index) => (
                <Square
                  key={index}
                  value={square}
                  onClick={() => handleClick(index)}
                />
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`mt-8 w-full px-6 py-3 rounded-xl font-medium text-white transition-colors
                ${isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
              onClick={resetGame}
            >
              Reset Game
            </motion.button>
          </motion.div>
        </SignedIn>

        <SignedOut>
          <motion.div
            className={`p-8 rounded-2xl shadow-2xl
              ${isDark ? 'bg-gray-800/90' : 'bg-white/90'}`}
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <p className={`text-xl font-medium
              ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              Please log in to play Tic Tac Toe!
            </p>
            <div className={`mt-4 px-6 py-2 rounded-lg transition-colors
              ${isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-indigo-600 hover:bg-indigo-700'}
              text-white`}>
              <SignInButton />
            </div>
          </motion.div>
        </SignedOut>
      </motion.div>
    </main>
  );
}