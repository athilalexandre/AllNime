import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
      <h1 className="text-5xl font-extrabold text-text-main-light dark:text-text-main-dark">404</h1>
      <p className="text-text-muted-light dark:text-text-muted-dark">Página não encontrada.</p>
      <Link
        to="/"
        className="mt-2 bg-primary-light hover:bg-opacity-80 dark:bg-primary-dark dark:hover:bg-opacity-80 text-white font-semibold py-2 px-4 rounded-md transition-colors"
      >
        Voltar para a Home
      </Link>
    </div>
  );
};

export default NotFoundPage;


