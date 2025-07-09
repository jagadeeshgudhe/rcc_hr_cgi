import React from 'react';

/**
 * Formats the bot response text into structured React elements.
 */
export function formatBotReply(text) {
  if (!text) return null;

  const lines = text.split('\n').filter(line => line.trim());

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '15px', lineHeight: 1.6 }}>
      {lines.map((line, index) => {
        let formattedLine = line.trim();

        // Heading detection (full bold lines)
        const headingMatch = formattedLine.match(/^\*\*(.*?)\*\*$/);
        if (headingMatch) {
          return (
            <div key={index} style={{ marginTop: '1rem', fontWeight: 'bold', fontSize: '1.1em' }}>
              {headingMatch[1]}
            </div>
          );
        }

        // Replace inline **bold**
        const parts = formattedLine.split(/(\*\*.*?\*\*)/g).filter(Boolean);

        const renderedParts = parts.map((part, idx) => {
          const boldMatch = part.match(/^\*\*(.*?)\*\*$/);
          if (boldMatch) {
            return (
              <strong key={idx} style={{ fontWeight: 'bold' }}>
                {boldMatch[1]}
              </strong>
            );
          }
          return part;
        });

        // Replace URLs
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const finalParts = renderedParts.map((part, idx) => {
          if (typeof part === 'string' && urlRegex.test(part)) {
            const segments = part.split(urlRegex);
            return segments.map((seg, segIdx) => {
              if (urlRegex.test(seg)) {
                return (
                  <a key={segIdx} href={seg} target="_blank" rel="noopener noreferrer" style={{ color: '#3498db' }}>
                    {seg}
                  </a>
                );
              }
              return seg;
            });
          }
          return part;
        });

        return (
          <div key={index} style={{ marginLeft: '1.2rem', marginTop: '0.5rem' }}>
            • {finalParts}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Country selection component for the user to pick policy region
 */
export function CountrySelection({ onSelect }) {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '16px' }}>
      <p style={{ fontSize: '1.1em', marginBottom: '1.5em' }}>Which country's HR policies do you want to explore?</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1em' }}>
        <button onClick={() => onSelect('India')} style={buttonStyle}>🇮🇳 India</button>
        <button onClick={() => onSelect('Germany')} style={buttonStyle}>🇩🇪 Germany</button>
        <button onClick={() => onSelect('France')} style={buttonStyle}>🇫🇷 France</button>
      </div>
    </div>
  );
}

const buttonStyle = {
  padding: '12px 24px',
  fontSize: '1em',
  backgroundColor: '#ffffff',
  border: '1px solid #ddd',
  borderRadius: '8px',
  cursor: 'pointer',
  textAlign: 'left',
  transition: 'all 0.2s ease'
};

/**
 * Unavailable country message component
 */
export function UnavailableCountry({ country, onBack }) {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '16px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
        <p style={{ fontSize: '1.1em' }}>
          Currently, HR policy information for <strong>{country}</strong> is not available in this system.
        </p>
        <p style={{ color: '#666' }}>
          We are continuously working to expand our policy database. Please contact your local HR representative.
        </p>
      </div>
      <button onClick={onBack} style={{ marginTop: '1.5em', padding: '12px 24px', borderRadius: '8px' }}>
        ← Back to Country Selection
      </button>
    </div>
  );
}
