import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa'; // Import an icon

function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && query) {
      onSearch(query);
      setQuery('');
    }
  };

  return (
    <div className="search-bar">
      <FaSearch className="search-icon" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Search location"
        className="search-input"
      />
    </div>
  );
}

export default SearchBar;