import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

const ManualAnimeModal = ({ onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [rating, setRating] = useState(0);
  const [opinion, setOpinion] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('O título é obrigatório.');
      return;
    }
    if (!imageUrl.trim()) {
      setError('A imagem é obrigatória.');
      return;
    }
    if (rating < 1 || rating > 5) {
      setError('A nota deve ser de 1 a 5.');
      return;
    }
    onSave({
      id: uuidv4(),
      title: title.trim(),
      imageUrl: imageUrl.trim(),
      rating,
      opinion: opinion.trim(),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-2xl p-6 w-full max-w-md relative" onClick={e => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full text-text-muted-light dark:text-text-muted-dark hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label="Fechar modal"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold text-text-main-light dark:text-text-main-dark mb-4 text-center">Adicionar Anime Manualmente</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Título *</label>
            <input
              type="text"
              className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-card-light dark:bg-card-dark text-text-main-light dark:text-text-main-dark"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Imagem (URL) *</label>
            <input
              type="url"
              className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-card-light dark:bg-card-dark text-text-main-light dark:text-text-main-dark"
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nota *</label>
            <select
              className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-card-light dark:bg-card-dark text-text-main-light dark:text-text-main-dark"
              value={rating}
              onChange={e => setRating(Number(e.target.value))}
              required
            >
              <option value={0}>Selecione</option>
              {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Opinião</label>
            <textarea
              className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-card-light dark:bg-card-dark text-text-main-light dark:text-text-main-dark"
              value={opinion}
              onChange={e => setOpinion(e.target.value)}
              rows={3}
            />
          </div>
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <button
            type="submit"
            className="w-full bg-primary-light hover:bg-primary-dark text-white font-bold py-2.5 px-4 rounded-lg shadow-md transition-colors"
          >
            Salvar Anime
          </button>
        </form>
      </div>
    </div>
  );
};

export default ManualAnimeModal; 