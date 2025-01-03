import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [password, setPassword] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showInitialModal, setShowInitialModal] = useState(true);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Don't start fetching until user makes a choice in initial modal
        if (!isLoading) {
            // Initial fetch
            fetchMessages();

            // Set up auto-reload every 2 seconds
            const interval = setInterval(fetchMessages, 2000);

            // Cleanup interval on component unmount
            return () => clearInterval(interval);
        }
    }, [isLoading]);

    const fetchMessages = async () => {
        try {
            const response = await axios.get('https://baka-be.vercel.app/api/messages');
            setMessages(response.data);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const handleInitialChoice = async (shouldDelete) => {
        if (shouldDelete) {
            try {
                await axios.delete('https://baka-be.vercel.app/api/messages', {
                    data: { password }
                });
                setPassword('');
                setShowInitialModal(false);
                setIsLoading(false);
            } catch (error) {
                if (error.response?.status === 401) {
                    alert('Invalid password');
                    return;
                }
                console.error('Error clearing messages:', error);
            }
        } else {
            setShowInitialModal(false);
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            await axios.post('https://baka-be.vercel.app/api/messages', {
                content: newMessage
            });
            setNewMessage('');
            fetchMessages();
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const handleDeleteMessage = async (id) => {
        try {
            await axios.delete(`https://baka-be.vercel.app/api/messages/${id}`);
            fetchMessages();
        } catch (error) {
            console.error('Error deleting message:', error);
        }
    };

    const handleClearAll = async () => {
        try {
            await axios.delete('https://chat-ttud.vercel.app/api/messages', {
                data: { password }
            });
            setPassword('');
            setShowDeleteModal(false);
            fetchMessages();
        } catch (error) {
            if (error.response?.status === 401) {
                alert('Invalid password');
            } else {
                console.error('Error clearing messages:', error);
            }
        }
    };

    if (isLoading) {
        return (
            <div className="App">
                {showInitialModal && (
                    <div className="modal-overlay">
                        <div className="modal">
                            <h2>.</h2>
                            <p>ディリト</p>
                            {password !== '' && (
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter password to delete"
                                />
                            )}
                            <div className="modal-buttons">
                                {password === '' ? (
                                    <>
                                        <button onClick={() => setPassword('1')}>はい</button>
                                        <button onClick={() => handleInitialChoice(false)}>いいえ</button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => handleInitialChoice(true)}>確認</button>
                                        <button onClick={() => handleInitialChoice(false)}>Cancel</button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="App">
            <header>
                <h1>ばか</h1>
                <button 
                    className="clear-all-btn"
                    onClick={() => setShowDeleteModal(true)}
                >
                    8386
                </button>
            </header>
            
            <div className="message-container">
                {messages.map((message) => (
                    <div key={message._id} className="message">
                        <div className="message-content">
                            <p>{message.content}</p>
                            <small>{new Date(message.timestamp).toLocaleString()}</small>
                        </div>
                        <button 
                            className="delete-btn"
                            onClick={() => handleDeleteMessage(message._id)}
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>

            <form onSubmit={handleSubmit} className="message-form">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                />
                <button type="submit">Send</button>
            </form>

            {showDeleteModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>Clear All Messages</h2>
                        <p>Enter password to confirm:</p>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                        />
                        <div className="modal-buttons">
                            <button onClick={handleClearAll}>Confirm</button>
                            <button onClick={() => {
                                setShowDeleteModal(false);
                                setPassword('');
                            }}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
