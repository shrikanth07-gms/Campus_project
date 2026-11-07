import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useDocuments } from '../../context/DocumentContext';
import { Send, User, Shield, Lock } from 'lucide-react';

export default function MessageThread({ submissionId, recipientName = 'Recipient' }) {
  const { user, profile, role } = useAuth();
  const { getSubmissionMessages, sendMessage } = useDocuments();
  const [text, setText] = useState('');
  const [isInternal, setIsInternal] = useState(false);

  const messages = getSubmissionMessages(submissionId);
  const isFacultyOrAdmin = ['faculty', 'hod', 'director', 'admin'].includes(role);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    sendMessage(submissionId, text, isInternal);
    setText('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '380px' }}>
      {/* Header */}
      <div
        style={{
          padding: '14px 18px',
          borderBottom: '1px solid var(--gray-200)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--gray-50)',
          borderTopLeftRadius: 'var(--radius-lg)',
          borderTopRightRadius: 'var(--radius-lg)'
        }}
      >
        <div>
          <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--gray-800)' }}>
            Direct Submission Thread
          </span>
          <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>
            Conversation with {recipientName}
          </div>
        </div>

        <span style={{ fontSize: '11px', color: 'var(--gray-400)', background: 'white', padding: '3px 8px', borderRadius: '12px', border: '1px solid var(--gray-200)' }}>
          Submission-scoped
        </span>
      </div>

      {/* Message List */}
      <div
        style={{
          flex: 1,
          padding: '20px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          backgroundColor: '#fafcff'
        }}
      >
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--gray-400)', margin: 'auto', fontSize: '13px' }}>
            No messages yet. Send a message to start communicating directly regarding this document.
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === user?.id;

            return (
              <div
                key={msg.id}
                style={{
                  alignSelf: isMe ? 'flex-end' : 'flex-start',
                  maxWidth: '80%'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '4px',
                    justifyContent: isMe ? 'flex-end' : 'flex-start'
                  }}
                >
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--gray-700)' }}>
                    {msg.sender_name}
                  </span>
                  <span
                    style={{
                      fontSize: '10px',
                      textTransform: 'uppercase',
                      padding: '1px 5px',
                      borderRadius: '4px',
                      backgroundColor: msg.sender_role === 'student' ? 'var(--primary-100)' : '#fef3c7',
                      color: msg.sender_role === 'student' ? 'var(--primary-700)' : '#b45309',
                      fontWeight: 700
                    }}
                  >
                    {msg.sender_role}
                  </span>
                  {msg.is_internal && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', fontSize: '10px', color: '#6d28d9', background: '#f5f3ff', padding: '1px 5px', borderRadius: '4px' }}>
                      <Lock size={10} /> Internal
                    </span>
                  )}
                  <span style={{ fontSize: '11px', color: 'var(--gray-400)' }}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-lg)',
                    borderTopRightRadius: isMe ? '2px' : 'var(--radius-lg)',
                    borderTopLeftRadius: !isMe ? '2px' : 'var(--radius-lg)',
                    backgroundColor: isMe ? 'var(--primary-600)' : 'white',
                    color: isMe ? 'white' : 'var(--gray-800)',
                    boxShadow: 'var(--shadow-sm)',
                    border: isMe ? 'none' : '1px solid var(--gray-200)',
                    fontSize: '14px',
                    lineHeight: 1.5,
                    wordBreak: 'break-word'
                  }}
                >
                  {msg.message_text}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input Box */}
      <form
        onSubmit={handleSend}
        style={{
          padding: '14px 18px',
          borderTop: '1px solid var(--gray-200)',
          backgroundColor: 'white',
          borderBottomLeftRadius: 'var(--radius-lg)',
          borderBottomRightRadius: 'var(--radius-lg)'
        }}
      >
        {isFacultyOrAdmin && (
          <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <label style={{ fontSize: '12px', color: 'var(--gray-600)', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={isInternal}
                onChange={(e) => setIsInternal(e.target.checked)}
              />
              Internal note (hidden from student)
            </label>
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            className="form-control"
            placeholder={isInternal ? "Write internal reviewer note..." : "Type your message to faculty / student..."}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" style={{ padding: '0 18px' }}>
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}

