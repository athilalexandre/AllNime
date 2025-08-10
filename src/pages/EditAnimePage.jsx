import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getAnimeDetailsById } from '../services/jikanService';
import { Star } from 'lucide-react';

const EditAnimePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [anime, setAnime] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [userOpinion, setUserOpinion] = useState('');
  const [saveStatus, setSaveStatus] = useState({ message: '', type: '' });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnimeData = async () => {
      try {
        const res = await getAnimeDetailsById(id);
        setAnime(res.data);
        
        // Busca avaliação do localStorage para animes do Jikan
        if (typeof window !== 'undefined' && window.localStorage) {
          const saved = localStorage.getItem(`animeRating_${id}`);
          if (saved) {
            const parsed = JSON.parse(saved);
            setUserRating(parsed.rating || 0);
            setUserOpinion(parsed.opinion || '');
          }
        }
      } catch (err) {
        console.error("Erro ao carregar dados do anime:", err);
        setError('Não foi possível carregar os dados do anime.');
      }
    };
    fetchAnimeData();
  }, [id]);

  const handleSave = (e) => {
    e.preventDefault();
    
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(`animeRating_${id}`, JSON.stringify({ rating: userRating, opinion: userOpinion }));
      setSaveStatus({ message: 'Avaliação salva com sucesso!', type: 'success' });
      setTimeout(() => navigate(`/anime/${id}`), 1200);
    } else {
      setSaveStatus({ message: 'Não foi possível salvar a avaliação.', type: 'error' });
    }
    setTimeout(() => { setSaveStatus({ message: '', type: '' }); }, 3000);
  };

  const handleRemoveRating = () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(`animeRating_${id}`);
      setUserRating(0);
      setUserOpinion('');
      setSaveStatus({ message: 'Avaliação removida com sucesso!', type: 'success' });
    } else {
      setSaveStatus({ message: 'LocalStorage não disponível. Avaliação não pôde ser removida.', type: 'error' });
    }
    setTimeout(() => { setSaveStatus({ message: '', type: '' }); }, 3000);
  };

  const renderStars = (currentRating) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`cursor-pointer h-6 w-6 ${currentRating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}`}
            onClick={() => setUserRating(star)}
          />
        ))}
      </div>
    );
  };

  if (error) return <p className="text-center p-10 text-red-500 dark:text-red-400">{error}</p>;
  if (!anime) return <p className="text-center p-10 text-text-muted-light dark:text-text-muted-dark">Carregando detalhes do anime...</p>;

  // Dados para exibição
  const displayImage = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || '';
  const displayTitle = anime.title || 'N/A';
  const displayJapaneseTitle = anime.title_japanese || 'N/A';
  const displaySynopsis = anime.synopsis ? anime.synopsis.replace(/\n/g, '\n\n') : 'N/A';
  const displayClassification = anime.rating || 'N/A';
  const displayPopularity = anime.popularity ? `#${anime.popularity}` : 'N/A';
  const displayTrailerId = anime.trailer?.youtube_id;
  const displayExternalLinks = anime.external_links || [];

  return (
    <div className="container mx-auto p-4 pt-20 text-text-light dark:text-text-dark">
      <Link to={`/anime/${id}`} className="text-primary-light dark:text-primary-dark hover:underline mb-4 inline-block">
        &larr; Voltar
      </Link>

      {/* Banner Image */}
      {anime.background && (
        <div className="relative w-full h-64 sm:h-80 md:h-96 rounded-lg overflow-hidden mb-8 shadow-xl">
          <img
            src={anime.background}
            alt={`${displayTitle} Banner`}
            className="w-full h-full object-cover filter brightness-75"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background-light dark:from-background-dark to-transparent"></div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8 mb-8">
        {/* Anime Cover Image */}
        <div className="flex-shrink-0 relative w-full md:w-auto md:max-w-xs">
          {displayImage && (
            <img
              src={displayImage}
              alt={displayTitle}
              className="w-full rounded-lg shadow-lg object-cover"
              loading="lazy"
            />
          )}
        </div>

        {/* Anime Details & Edit Form */}
        <div className="flex-grow">
          <h1 className="text-4xl font-extrabold mb-2 text-primary-light dark:text-primary-dark">
            {displayTitle}
          </h1>

          <div className="text-lg text-text-muted-light dark:text-text-muted-dark mb-4 space-y-1">
            {displayJapaneseTitle && (<p><strong>Título em Japonês:</strong> {displayJapaneseTitle}</p>)}
            {anime.status && (<p><strong>Status:</strong> {anime.status}</p>)}
            {anime.episodes && (<p><strong>Episódios:</strong> {anime.episodes}</p>)}
            {displayClassification && (<p><strong>Classificação:</strong> {displayClassification}</p>)}
            {displayPopularity && (<p><strong>Popularidade:</strong> {displayPopularity}</p>)}
          </div>

          <h2 className="text-2xl font-semibold mt-6 mb-2 text-text-light dark:text-text-dark">Sinopse</h2>
          <p className="text-text-muted-light dark:text-text-muted-dark mb-6 leading-relaxed whitespace-pre-wrap">
            {displaySynopsis}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 mb-6 text-sm">
            {anime.type && (
              <div>
                <span className="font-semibold">Tipo: </span>
                {anime.type}
              </div>
            )}
            {anime.source && (
              <div>
                <span className="font-semibold">Fonte: </span>
                {anime.source}
              </div>
            )}
            {anime.aired?.string && (
              <div>
                <span className="font-semibold">Período no Ar: </span>
                {anime.aired.string}
              </div>
            )}
            {anime.duration && (
              <div>
                <span className="font-semibold">Duração por Ep.: </span>
                {anime.duration}
              </div>
            )}
            {anime.genres && anime.genres.length > 0 && (
              <div>
                <span className="font-semibold">Gêneros: </span>
                {anime.genres.map(g => g.name).join(', ')}
              </div>
            )}
            {anime.studios && anime.studios.length > 0 && (
              <div>
                <span className="font-semibold">Estúdios: </span>
                {anime.studios.map(s => s.name).join(', ')}
              </div>
            )}
          </div>

          {/* Formulário de Edição */}
          <div className="bg-card-light dark:bg-card-dark p-6 rounded-lg shadow-md mt-8">
            <h2 className="text-2xl font-bold mb-4">Editar Avaliação</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label htmlFor="edit-rating" className="block font-semibold mb-1">Sua Nota</label>
                <div className="flex items-center">
                  {renderStars(userRating)}
                  <span className="ml-4 text-xl font-semibold">
                    {userRating > 0 ? `${userRating}/5` : 'Não Avaliado'}
                  </span>
                </div>
              </div>
              <div>
                <label htmlFor="edit-opinion" className="block font-semibold mb-1">Sua Opinião</label>
                <textarea
                  id="edit-opinion"
                  className="w-full p-3 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark"
                  rows="4"
                  placeholder="Sua opinião sobre este anime..."
                  value={userOpinion}
                  onChange={(e) => setUserOpinion(e.target.value)}
                ></textarea>
              </div>
              <div className="flex space-x-4">
                <button type="submit" className="px-6 py-2 bg-primary-light dark:bg-primary-dark text-white rounded-lg hover:opacity-90 transition-opacity">
                  Salvar
                </button>
                <button type="button" onClick={handleRemoveRating} className="px-6 py-2 bg-red-600 text-white rounded-lg hover:opacity-90 transition-opacity">
                  Remover Avaliação
                </button>
              </div>
              {saveStatus.message && (
                <p className={`mt-4 ${saveStatus.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                  {saveStatus.message}
                </p>
              )}
            </form>
          </div>

          {/* Trailer */}
          {displayTrailerId && (
            <div className="bg-card-light dark:bg-card-dark p-6 rounded-lg shadow-md mt-8">
              <h2 className="text-2xl font-bold mb-4">Trailer</h2>
              <div className="relative" style={{ paddingBottom: '56.25%', height: 0 }}>
                <iframe
                  src={`https://www.youtube.com/embed/${displayTrailerId}`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute top-0 left-0 w-full h-full rounded-lg"
                  title={`${displayTitle} Trailer`}
                ></iframe>
              </div>
            </div>
          )}

          {/* Links Externos */}
          {displayExternalLinks.length > 0 && (
            <div className="bg-card-light dark:bg-card-dark p-6 rounded-lg shadow-md mt-8">
              <h2 className="text-2xl font-bold mb-4">Links Externos</h2>
              <ul className="list-disc list-inside space-y-2">
                {displayExternalLinks.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-light dark:text-primary-dark hover:underline"
                    >
                      {link.name || link.url}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default EditAnimePage; 