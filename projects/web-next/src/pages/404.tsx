import { useNavigate } from 'react-router';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
        padding: '2rem',
      }}
    >
      <span style={{ fontSize: '64px', marginBottom: '1.5rem' }}>🌐</span>
      <h1
        style={{
          fontFamily: "'Sora', system-ui, sans-serif",
          fontSize: '2rem',
          fontWeight: 700,
          color: '#1C1917',
          marginBottom: '0.5rem',
          letterSpacing: '-0.03em',
        }}
      >
        Page Not Found
      </h1>
      <p
        style={{
          fontSize: '1rem',
          color: '#78716C',
          marginBottom: '2rem',
          maxWidth: '400px',
        }}
      >
        The page you are looking for doesn't exist or has been moved.
      </p>
      <button
        onClick={() => navigate('/')}
        style={{
          fontFamily: "'Sora', system-ui, sans-serif",
          fontSize: '0.875rem',
          fontWeight: 600,
          color: '#7C3AED',
          background: '#EDE9FE',
          border: 'none',
          padding: '0.75rem 1.5rem',
          borderRadius: '9999px',
          cursor: 'pointer',
          transition: 'all 150ms ease',
        }}
      >
        ← Back to Home
      </button>
    </div>
  );
};

export default NotFound;
