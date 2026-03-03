import React, { useEffect, useState, useRef } from "react";
import { Send, ArrowLeft } from "lucide-react";
import API from "../api/axios";
import { useParams, useNavigate } from "react-router-dom";

export default function Messages() {
    const { email } = useParams();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);
    const myEmail = localStorage.getItem("email");

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
    }, [email]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchMessages = async () => {
        try {
            const res = await API.get(`/messages/${email}`);
            setMessages(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.log("Error loading messages:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;

        setSending(true);
        try {
            await API.post("/messages/send", {
                receiverEmail: email,
                content: newMessage.trim()
            });
            setNewMessage("");
            fetchMessages();
        } catch (err) {
            console.log("Error sending message:", err);
            alert(err.response?.data?.error || "Failed to send message");
        } finally {
            setSending(false);
        }
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return "";
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return "";
        const date = new Date(timestamp);
        const today = new Date();
        if (date.toDateString() === today.toDateString()) return "Today";
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
        return date.toLocaleDateString();
    };

    // Group messages by date
    const groupedMessages = messages.reduce((groups, msg) => {
        const date = formatDate(msg.timestamp);
        if (!groups[date]) groups[date] = [];
        groups[date].push(msg);
        return groups;
    }, {});

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 80px)", maxHeight: "calc(100vh - 80px)" }}>
            {/* Header */}
            <div style={{
                display: "flex", alignItems: "center", gap: "12px",
                padding: "16px", borderBottom: "1px solid #e2e8f0",
                background: "#ffffff", borderRadius: "16px 16px 0 0"
            }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        background: "#f1f5f9", border: "none", padding: "8px",
                        borderRadius: "50%", cursor: "pointer", display: "flex"
                    }}
                >
                    <ArrowLeft size={18} color="#0f172a" />
                </button>
                <div style={{
                    width: "36px", height: "36px", borderRadius: "50%",
                    background: "#e0e7ff", color: "#4f46e5",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: "700", fontSize: "14px"
                }}>
                    {email.charAt(0).toUpperCase()}
                </div>
                <div>
                    <div style={{ fontWeight: "600", fontSize: "15px", color: "#0f172a" }}>{email}</div>
                    <div style={{ fontSize: "12px", color: "#94a3b8" }}>Private Conversation</div>
                </div>
            </div>

            {/* Messages Area */}
            <div style={{
                flex: 1, overflowY: "auto", padding: "16px",
                background: "#f8fafc", display: "flex", flexDirection: "column", gap: "8px"
            }}>
                {loading ? (
                    <div style={{ textAlign: "center", color: "#94a3b8", padding: "40px 0" }}>Loading messages...</div>
                ) : messages.length === 0 ? (
                    <div style={{ textAlign: "center", color: "#94a3b8", padding: "40px 0" }}>
                        No messages yet. Start the conversation!
                    </div>
                ) : (
                    Object.entries(groupedMessages).map(([date, msgs]) => (
                        <div key={date}>
                            <div style={{
                                textAlign: "center", fontSize: "12px", color: "#94a3b8",
                                margin: "12px 0", fontWeight: "500"
                            }}>
                                {date}
                            </div>
                            {msgs.map((msg) => {
                                const isMine = msg.senderEmail === myEmail;
                                return (
                                    <div key={msg.id} style={{
                                        display: "flex",
                                        justifyContent: isMine ? "flex-end" : "flex-start",
                                        marginBottom: "6px"
                                    }}>
                                        <div style={{
                                            maxWidth: "70%",
                                            padding: "10px 14px",
                                            borderRadius: isMine ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                                            background: isMine ? "#3b82f6" : "#ffffff",
                                            color: isMine ? "#ffffff" : "#0f172a",
                                            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                                            fontSize: "14px", lineHeight: "1.5"
                                        }}>
                                            <div>{msg.content}</div>
                                            <div style={{
                                                fontSize: "11px", marginTop: "4px",
                                                color: isMine ? "rgba(255,255,255,0.7)" : "#94a3b8",
                                                textAlign: "right"
                                            }}>
                                                {formatTime(msg.timestamp)}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} style={{
                display: "flex", gap: "8px", padding: "12px 16px",
                borderTop: "1px solid #e2e8f0", background: "#ffffff",
                borderRadius: "0 0 16px 16px"
            }}>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    style={{
                        flex: 1, padding: "10px 16px", border: "1px solid #e2e8f0",
                        borderRadius: "24px", fontSize: "14px", outline: "none",
                        background: "#f8fafc"
                    }}
                />
                <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    style={{
                        padding: "10px 16px", border: "none", borderRadius: "24px",
                        background: newMessage.trim() ? "#3b82f6" : "#e2e8f0",
                        color: newMessage.trim() ? "#ffffff" : "#94a3b8",
                        cursor: newMessage.trim() ? "pointer" : "default",
                        display: "flex", alignItems: "center", gap: "6px",
                        fontSize: "14px", fontWeight: "500"
                    }}
                >
                    <Send size={16} /> Send
                </button>
            </form>
        </div>
    );
}
