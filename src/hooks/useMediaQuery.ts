import { useEffect, useState } from 'react';

/**
 * Custom hook for media queries
 * 
 * @param query - The media query to check
 * @returns Whether the media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    // Check if window is defined (to handle SSR)
    if (typeof window !== 'undefined') {
      const media = window.matchMedia(query);
      // Initial match
      setMatches(media.matches);
      
      // Update match state on change
      const listener = (event: MediaQueryListEvent) => setMatches(event.matches);
      media.addEventListener('change', listener);
      
      // Clean up
      return () => media.removeEventListener('change', listener);
    }
    
    return undefined;
  }, [query]);
  
  return matches;
}

export default useMediaQuery; 