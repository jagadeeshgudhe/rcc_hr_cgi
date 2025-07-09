import React, { useMemo } from 'react';
import { categorySuggestions } from '../../data/categorySuggestions';
import '../../styles/chat/Suggestions.css';

const Suggestions = ({ category, suggestions, onSuggestionClick }) => {
  // Memoize the suggestions to prevent unnecessary recalculations
  const displaySuggestions = useMemo(() => {
    // If valid suggestions are provided, use them
    if (Array.isArray(suggestions) && suggestions.length > 0) {
      return suggestions.slice(0, 5);
    }
    
    // If category exists in our map, use those suggestions
    if (category && categorySuggestions[category]) {
      // Randomly select 5 suggestions from the category to provide variety
      const categoryQuestions = [...categorySuggestions[category]];
      const selected = [];
      while (selected.length < 5 && categoryQuestions.length > 0) {
        const randomIndex = Math.floor(Math.random() * categoryQuestions.length);
        selected.push(categoryQuestions.splice(randomIndex, 1)[0]);
      }
      return selected;
    }
    
    // Fallback to random general suggestions
    return categorySuggestions['General'].slice(0, 5);
  }, [category, suggestions]);

  if (!displaySuggestions.length) return null;

  return (
    <div className="suggestions-container">
      <h4 className="suggestions-title">You might also want to ask:</h4>
      <div className="suggestions-list">
        {displaySuggestions.map((suggestion, index) => (
          <button
            key={`${category}-${index}-${suggestion}`}
            className="suggestion-button"
            onClick={() => onSuggestionClick(suggestion)}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Suggestions; 