import React, { useState, useRef, useEffect } from 'react';

const TextInputModal = ({ isOpen, onClose, onSubmit, defaultText = '' }) => {
  const [text, setText] = useState(defaultText);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      // Select all text if editing
      if (defaultText) {
        setTimeout(() => inputRef.current?.select(), 0);
      }
    }
  }, [isOpen, defaultText]);

  const handleSubmit = () => {
    onSubmit(text);
    setText(defaultText);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit();
    }
    if (e.key === 'Escape') {
      onClose();
      setText(defaultText);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h3 style={styles.title}>📝 Add Text</h3>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={styles.body}>
          <textarea
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter your text here... (Ctrl+Enter to save, Esc to cancel)"
            style={styles.textarea}
          />
        </div>

        <div style={styles.footer}>
          <button
            onClick={onClose}
            style={{ ...styles.btn, ...styles.cancelBtn }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            style={{ ...styles.btn, ...styles.submitBtn }}
          >
            Add Text Box
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(4px)',
  },

  modal: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    width: '90%',
    maxWidth: '500px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    animation: 'slideUp 0.3s ease-out',
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    borderBottom: '1px solid #e5e7eb',
    backgroundColor: '#f9fafb',
  },

  title: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827',
  },

  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#6b7280',
    padding: '0',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '6px',
    transition: 'all 0.2s',
  },

  body: {
    padding: '20px',
    flex: 1,
  },

  textarea: {
    width: '100%',
    height: '150px',
    padding: '12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'inherit',
    resize: 'vertical',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'border-color 0.2s',
  },

  footer: {
    display: 'flex',
    gap: '12px',
    padding: '16px 20px',
    borderTop: '1px solid #e5e7eb',
    justifyContent: 'flex-end',
  },

  btn: {
    padding: '10px 16px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.2s',
  },

  cancelBtn: {
    backgroundColor: '#e5e7eb',
    color: '#374151',
  },

  submitBtn: {
    backgroundColor: '#3b82f6',
    color: 'white',
  },
};

export default TextInputModal;
