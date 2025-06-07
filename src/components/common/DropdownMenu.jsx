// src/components/common/DropdownMenu.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

const DropdownMenu = ({ label, items }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => setIsOpen(!isOpen);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    // Adiciona o event listener apenas se o menu estiver aberto, ou sempre e verifica isOpen dentro?
    // Adicionar sempre é mais simples de gerenciar.
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []); // Dependência vazia para adicionar/remover listener apenas uma vez

  if (!items || items.length === 0) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="flex items-center text-sm sm:text-base text-text-main-light dark:text-text-main-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {label}
        <ChevronDown size={16} className={`ml-1 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 origin-top-right bg-card-light dark:bg-card-dark rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            {items.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setIsOpen(false)} // Fecha o menu ao clicar no item
                className="flex items-center px-4 py-2 text-sm text-text-main-light dark:text-text-main-dark hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary-light dark:hover:text-primary-dark transition-colors w-full text-left"
                // Adicionado w-full e text-left para consistência se o botão fosse um <button>
                role="menuitem"
              >
                {item.icon && <item.icon size={16} className="mr-2 flex-shrink-0" />} {/* Adicionado flex-shrink-0 */}
                <span className="truncate">{item.label}</span> {/* Adicionado truncate */}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
export default DropdownMenu;
