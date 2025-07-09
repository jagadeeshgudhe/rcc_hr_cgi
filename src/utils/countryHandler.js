/**
 * Handles country selection events from the chatbot interface
 * @param {string} country - The selected country name
 */
window.handleCountrySelection = (country) => {
  // Handle the back button action
  if (country === 'back') {
    // Clear the selected country
    localStorage.removeItem('selectedCountry');
    
    // Dispatch event to show country selection again
    const event = new CustomEvent('countrySelected', {
      detail: { 
        country: null,
        isInitialQuery: true
      }
    });
    window.dispatchEvent(event);
    return;
  }

  // Store the selection
  localStorage.setItem('selectedCountry', country);

  // Dispatch a custom event that your app can listen to
  const event = new CustomEvent('countrySelected', {
    detail: { 
      country,
      // For Germany and France, we'll show the unavailable message
      showUnavailableMessage: country === 'Germany' || country === 'France'
    }
  });
  window.dispatchEvent(event);

  // If India is selected, proceed with the query
  if (country === 'India') {
    // You can trigger your query here
    // For example:
    // window.triggerQuery('Show HR policies', { selectedCountry: 'India' });
  }
}; 