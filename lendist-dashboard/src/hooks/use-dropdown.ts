import { useState, useEffect, useRef } from 'react';

export interface UseDropdownReturn {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  toggle: () => void;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
}

export function useDropdown(initialState = false): UseDropdownReturn {
  const [isOpen, setIsOpen] = useState(initialState);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const toggle = () => setIsOpen(prev => !prev);
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    // Only add the event listener when the dropdown is open
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);
  
  return { isOpen, setIsOpen, toggle, dropdownRef };
} 