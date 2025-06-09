import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAnimeDetailsById } from '../services/jikanService';
import { getManualAnimeById, updateManualAnime } from '../services/watchlistStorageService';

const EditAnimePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [anime, setAnime] = useState(null);
  const [isManual, setIsManual] = useState(false);
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [rating, setRating] = useState(0);
  const [opinion, setOpinion] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Primeiro tenta buscar como manual
    const manual = getManualAnimeById(id);
    if (manual) {
      setIsManual(true);
      setAnime(manual);
      setTitle(manual.title);
      setImageUrl(manual.imageUrl);
      setRating(manual.rating);
      setOpinion(manual.opinion);
      return;
    }
    // Se não for manual, busca pelo Jikan
    getAnimeDetailsById(id)
      .then(res => {
        setAnime(res.data);
        setTitle(res.data.title);
        setImageUrl(res.data.images?.jpg?.large_image_url || res.data.images?.jpg?.image_url || '');
        // Busca avaliação do localStorage
        if (typeof window !== 'undefined' && window.localStorage) {
          const saved = localStorage.getItem(`animeRating_${id}`);
          if (saved) {
            const parsed = JSON.parse(saved);
            setRating(parsed.rating || 0);
            setOpinion(parsed.opinion || '');
          }
        }
      })
      .catch(() => setError('Não foi possível carregar os dados do anime.'));
  }, [id]);

  const handleSave = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setStatusMsg('O título é obrigatório.');
      return;
    }
    if (isManual) {
      updateManualAnime(id, { title, imageUrl, rating, opinion });
      setStatusMsg('Anime manual atualizado com sucesso!');
      setTimeout(() => navigate('/'), 1200);
    } else {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(`animeRating_${id}`, JSON.stringify({ rating, opinion }));
        setStatusMsg('Avaliação salva com sucesso!');
        setTimeout(() => navigate(`/anime/${id}`), 1200);
      } else {
        setStatusMsg('Não foi possível salvar a avaliação.');
      }
    }
  };

  if (error) return <p className="text-center p-10 text-red-500">{error}</p>;
  if (!anime) return <p className="text-center p-10">Carregando...</p>;

  return (
    <div className="container mx-auto p-4 pt-20 max-w-xl">
      <h1 className="text-3xl font-bold mb-6">Editar Anime</h1>
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block font-semibold mb-1">Título</label>
          <input type="text" className="w-full p-2 rounded border border-gray-300 dark:border-gray-600" value={title} onChange={e => setTitle(e.target.value)} required />
        </div>
        <div>
          <label className="block font-semibold mb-1">Imagem (URL)</label>
          <input type="url" className="w-full p-2 rounded border border-gray-300 dark:border-gray-600" value={imageUrl} onChange={e => setImageUrl(e.target.value)} required />
        </div>
        <div>
          <label className="block font-semibold mb-1">Nota</label>
          <select className="w-full p-2 rounded border border-gray-300 dark:border-gray-600" value={rating} onChange={e => setRating(Number(e.target.value))} required>
            <option value={0}>Selecione</option>
            {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1">Opinião</label>
          <textarea className="w-full p-2 rounded border border-gray-300 dark:border-gray-600" value={opinion} onChange={e => setOpinion(e.target.value)} rows={3} />
        </div>
        <button type="submit" className="w-full bg-primary-light hover:bg-primary-dark text-white font-bold py-2.5 px-4 rounded-lg shadow-md transition-colors">Salvar</button>
        {statusMsg && <div className="text-center mt-2 text-green-600 dark:text-green-400">{statusMsg}</div>}
      </form>
    </div>
  );
};

export default EditAnimePage; 