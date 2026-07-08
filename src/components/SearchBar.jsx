import React from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({
  value,
  onChange,
  placeholder = "Search...",
  onKeyDown,
  className = "",
  inputClassName = "",
  iconClassName = "",
  iconSize = 16
}) => {
  return (
    <div className={`relative ${className}`}>
      <Search
        size={iconSize}
        className={`absolute top-1/2 -translate-y-1/2 text-gray-400 transition-colors duration-300 ${iconClassName}`}
      />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        className={inputClassName}
      />
    </div>
  );
};

export default SearchBar;
