import { useEffect, useRef, useState } from "react";
import { Avatar, IconButton, TextField } from "@mui/material";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import PageHeading from "../components/PageHeading";

export default function MessagesPage({ threads, onSendMessage, onMarkRead }) {
  const [selectedId, setSelectedId] = useState(threads[0]?.id || "");
  const [message, setMessage] = useState("");
  const conversationEndRef = useRef(null);
  const selectedThread = threads.find((thread) => thread.id === selectedId) || threads[0];

  useEffect(() => {
    if (selectedThread) onMarkRead(selectedThread.id);
  }, [selectedThread?.id, selectedThread?.unread, onMarkRead]);

  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [selectedThread?.messages.length]);

  const selectThread = (thread) => {
    setSelectedId(thread.id);
    onMarkRead(thread.id);
  };

  const submitMessage = (event) => {
    event.preventDefault();
    const text = message.trim();
    if (!text || !selectedThread) return;
    onSendMessage(selectedThread.id, text);
    setMessage("");
  };

  return (
    <>
      <PageHeading eyebrow="STAY CONNECTED" title="Messages" description="Connect with your instructors and get your questions answered." />
      <section className="section-card messages-card">
        <div className="thread-list">
          <h2>Conversations</h2>
          {threads.map((thread) => (
            <button className={`thread-item ${selectedId === thread.id ? "thread-active" : ""}`} key={thread.id} onClick={() => selectThread(thread)}>
              <Avatar className={`thread-avatar ${thread.color}`}>{thread.initials}</Avatar>
              <span className="thread-copy">
                <strong>{thread.name}</strong>
                <span>{thread.messages.at(-1)?.text || thread.course}</span>
              </span>
              {thread.unread > 0 && <span className="thread-unread" aria-label={`${thread.unread} unread messages`}>{thread.unread}</span>}
              <span className="thread-time">{thread.messages.at(-1)?.time}</span>
            </button>
          ))}
          {threads.length === 0 && <p className="empty-copy">No conversations yet.</p>}
        </div>
        {selectedThread ? (
          <div className="conversation">
            <div className="conversation-header">
              <Avatar className={`thread-avatar ${selectedThread.color}`}>{selectedThread.initials}</Avatar>
              <div><strong>{selectedThread.name}</strong><span>{selectedThread.course} instructor</span></div>
            </div>
            <div className="conversation-body" aria-live="polite">
              <div className="message-date">Conversation</div>
              {selectedThread.messages.map((item) => (
                <div className={`message-bubble ${item.sent ? "sent" : "received"}`} key={item.id}>
                  {item.text}<span>{item.time}</span>
                </div>
              ))}
              <div ref={conversationEndRef} />
            </div>
            <form className="message-composer" onSubmit={submitMessage}>
              <TextField
                fullWidth
                size="small"
                placeholder="Write a message..."
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                inputProps={{ "aria-label": "Write a message", maxLength: 1000 }}
              />
              <IconButton type="submit" className="send-button" aria-label="Send message" disabled={!message.trim()}>
                <SendRoundedIcon />
              </IconButton>
            </form>
          </div>
        ) : (
          <div className="empty-state"><strong>Select a conversation</strong><span>Choose an instructor to view your messages.</span></div>
        )}
      </section>
    </>
  );
}
