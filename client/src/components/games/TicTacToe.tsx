import React, { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';

interface TicTacToeProps {
    socket: Socket | null;
    roomId: string;
    isMyTurn: boolean;
    mySymbol: 'X' | 'O';
    board: (string | null)[];
    winner: string | null;
    onMove: (index: number) => void;
    onReset: () => void;
}

const TicTacToe: React.FC<TicTacToeProps> = ({
    isMyTurn,
    mySymbol,
    board,
    winner,
    onMove,
    onReset
}) => {

    const getStatus = () => {
        if (winner) {
            if (winner === 'draw') return "It's a Draw!";
            return winner === mySymbol ? "You Won! 🎉" : "You Lost 😔";
        }
        return isMyTurn ? "Your Turn" : "Opponent's Turn";
    };

    return (
        <div className="flex-center" style={{ flexDirection: 'column', gap: '2rem' }}>

            {/* Status Header */}
            <div style={{ textAlign: 'center' }}>
                <h2 style={{
                    fontSize: '2.5rem',
                    background: winner ? 'var(--gradient-main)' : 'none',
                    WebkitBackgroundClip: winner ? 'text' : 'none',
                    WebkitTextFillColor: winner ? 'transparent' : 'inherit',
                    color: isMyTurn ? '#fff' : 'var(--text-secondary)'
                }}>
                    {getStatus()}
                </h2>
                <div style={{ marginTop: '0.5rem', fontSize: '1.2rem', color: 'var(--text-secondary)' }}>
                    You are playing as <span style={{ fontWeight: 'bold', color: 'var(--accent-primary)' }}>{mySymbol}</span>
                </div>
            </div>

            {/* Board */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '10px',
                background: 'rgba(255,255,255,0.1)',
                padding: '10px',
                borderRadius: '16px',
                width: '300px',
                height: '300px'
            }}>
                {board.map((cell, index) => (
                    <button
                        key={index}
                        onClick={() => onMove(index)}
                        disabled={!!cell || !!winner || !isMyTurn}
                        style={{
                            background: 'rgba(0,0,0,0.3)',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '3rem',
                            fontWeight: 'bold',
                            color: cell === 'X' ? '#ec4899' : '#8b5cf6',
                            cursor: (!!cell || !!winner || !isMyTurn) ? 'default' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'background 0.2s'
                        }}
                        className={(!cell && !winner && isMyTurn) ? "hover:bg-white/10" : ""}
                    >
                        {cell}
                    </button>
                ))}
            </div>

            {/* Reset Button */}
            {winner && (
                <button className="btn-primary" onClick={onReset}>
                    Play Again
                </button>
            )}

        </div>
    );
};

export default TicTacToe;
