import React from 'react';

const ConfirmDialog = ({ isOpen, message, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="confirm-dialog" style={styles.dialog}>
      <div className="dialog-content" style={styles.content}>
        <p style={styles.message}>{message}</p>
        <div style={styles.buttonContainer}>
          <button onClick={onConfirm} style={styles.button}>Purchase</button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  dialog: {
    position: 'fixed',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000, // Ensure the dialog is on top
  },
  content: {
    background: 'white',
    padding: '30px',
    borderRadius: '10px',
    textAlign: 'center',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
  },
  message: {
    fontSize: '18px',
    marginBottom: '20px',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'space-around',
  },
  button: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    backgroundColor: '#007BFF', // Bootstrap primary color
    color: 'white',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  cancelButton: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    backgroundColor: '#6c757d', // Bootstrap secondary color
    color: 'white',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
};

// Adding hover effect for the buttons
styles.buttonHover = {
  backgroundColor: '#0056b3', // Darker shade for hover
};

styles.cancelButtonHover = {
  backgroundColor: '#5a6268', // Darker shade for hover
};

export default ConfirmDialog;