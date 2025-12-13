'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface SearchResult {
  id: string;
  description: string;
  address?: string;
  category: string;
  status: string;
  user: {
    firstName: string;
    lastName: string;
  };
}

export default function SearchBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (query.trim().length === 0) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/incidents/search?query=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (data.success) {
        setResults(data.incidents);
        setIsOpen(true);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Could navigate to a search results page if needed
    if (searchQuery.trim()) {
      window.location.href = `/incidents?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="hidden sm:flex items-center flex-1 max-w-md relative">
      <form onSubmit={handleSubmit} className="w-full">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search incidents..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => searchQuery.trim().length > 0 && setIsOpen(true)}
            className="w-full px-4 py-2 pr-10 text-sm rounded-lg border border-gray-200 bg-gray-50 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        </div>

        {/* Search Results Dropdown */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                Loading...
              </div>
            ) : results.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {results.map((incident) => (
                  <li key={incident.id}>
                    <Link
                      href={`/incidents/${incident.id}`}
                      className="block p-3 hover:bg-gray-50 transition"
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {incident.description}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {incident.address || 'No address'}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="inline-block px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                              {incident.category}
                            </span>
                            <span className="inline-block px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded">
                              {incident.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-4 text-center text-gray-500 text-sm">
                No results found
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
