// Exemplo parcial de AnimeDetailPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAnimeDetailsById } from '../services/jikanService';
import { getAnimeWatchInfo } from '../services/consumetService';
import { Star } from 'lucide-react'; // Ícone de estrela
import WatchlistControls from '../components/features/anime-detail/WatchlistControls'; // Adicionar import

const AnimeDetailPage = () => {
  const { id } = useParams(); // id é string aqui
  const [anime, setAnime] = useState(null);
  const [streamingEpisodes, setStreamingEpisodes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [userOpinion, setUserOpinion] = useState('');
  const [saveStatus, setSaveStatus] = useState({ message: '', type: '' }); // type: 'success' ou 'error'

  useEffect(() => {
    const fetchDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const detailsResponse = await getAnimeDetailsById(id);
        setAnime(detailsResponse.data);

        // Tentar buscar links de streaming com o título do anime
        if (detailsResponse.data?.title) {
          try {
            const watchInfoResponse = await getAnimeWatchInfo(detailsResponse.data.title);
            // A Consumet pode retornar múltiplos resultados, pegar o primeiro ou o mais relevante
            // E depois pegar os episódios. Exemplo:
            if (watchInfoResponse?.results?.[0]?.id) {
                // Uma segunda chamada pode ser necessária para pegar os episódios usando o ID da Consumet
                // Ou a API já retorna os episódios diretamente, depende da estrutura exata.
                // Por simplicidade, vamos assumir que watchInfoResponse.results[0].episodes é uma lista.
                // Este trecho precisará de ajuste fino conforme a API da Consumet.
                // const episodeData = await getEpisodesFromConsumet(watchInfoResponse.results[0].id)
                // setStreamingEpisodes(episodeData.episodes || []);
                // Por enquanto, vamos simular que já temos os episódios se a busca por título der certo:
                 if(watchInfoResponse?.results?.[0]?.episodes) {
                    setStreamingEpisodes(watchInfoResponse.results[0].episodes.slice(0, 5)); // Pegar os 5 primeiros
                 } else if (watchInfoResponse?.results?.[0]?.id) {
                    // Se não vier direto, e tiver um ID, simular que pegamos com esse ID
                    // Em um caso real, faria outra chamada à Consumet com esse ID para pegar episódios.
                    // Ex: GET https://api.consumet.org/anime/gogoanime/watch/{episodeId} (onde episodeId vem de uma lista de episódios)
                    // Ou GET https://api.consumet.org/anime/gogoanime/info/{consumetId} (que retorna lista de episodios)
                    // Vamos assumir que a info já traz os episódios se a busca por título for bem sucedida.
                    const consumetAnimeId = watchInfoResponse.results[0].id;
                    // Mock: const episodes = await fetchEpisodesForConsumetId(consumetAnimeId);
                    // setStreamingEpisodes(episodes.slice(0,5));
                    // Por ora, se achou um resultado na Consumet, vamos apenas logar e não popular episódios ainda
                    // para evitar complexidade excessiva neste passo.
                    console.log("Anime encontrado na Consumet:", watchInfoResponse.results[0]);
                 }
            }
          } catch (consumetError) {
            console.warn("Não foi possível obter links de streaming da Consumet:", consumetError);
            // Não tratar como erro fatal, a página de detalhes ainda pode ser útil.
          }
        }

        // Carregar avaliação do localStorage
        // No ambiente de servidor/ferramenta, localStorage não está disponível.
        // Envolver em try-catch ou verificar 'typeof window'.
        if (typeof window !== 'undefined' && window.localStorage) {
            const savedRating = localStorage.getItem(`animeRating_${id}`);
            if (savedRating) {
              const parsedRating = JSON.parse(savedRating);
              setUserRating(parsedRating.rating || 0);
              setUserOpinion(parsedRating.opinion || '');
            }
        }

      } catch (err) {
        console.error("Erro ao buscar detalhes do anime:", err);
        setError('Falha ao carregar detalhes do anime.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const handleSaveRating = () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const ratingData = { rating: userRating, opinion: userOpinion };
      localStorage.setItem(`animeRating_${id}`, JSON.stringify(ratingData));
      setSaveStatus({ message: 'Avaliação salva com sucesso!', type: 'success' });
    } else {
      console.warn("localStorage não disponível para salvar avaliação.");
      setSaveStatus({ message: 'LocalStorage não disponível. Avaliação não pôde ser salva.', type: 'error' });
    }
    setTimeout(() => {
      setSaveStatus({ message: '', type: '' });
    }, 3000);
  };

  const StarRating = () => (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          onClick={() => setUserRating(star)}
          className={`cursor-pointer h-8 w-8 ${userRating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}`}
        />
      ))}
    </div>
  );

  if (isLoading) return <p className="text-center p-10">Carregando detalhes...</p>;
  if (error) return <p className="text-center p-10 text-red-500">{error}</p>;
  if (!anime) return <p className="text-center p-10 text-text-muted-light dark:text-text-muted-dark">Anime não encontrado.</p>;

  return (
    <div className="container mx-auto p-4"> {/* Removido text-gray-900 dark:text-gray-100 */}
      <Link to="/" className="text-primary-light dark:text-primary-dark hover:underline mb-4 inline-block">&larr; Voltar para a busca</Link>
      <div className="md:flex md:space-x-8">
        <div className="w-full max-w-xs sm:max-w-sm mx-auto md:w-1/3 md:max-w-none md:mx-0 mb-6 md:mb-0">
          <img src={anime.images?.jpg?.large_image_url} alt={anime.title} className="rounded-lg shadow-lg w-full" />
        </div>
        <div className="md:w-2/3">
          {/* Textos principais usarão text-text-main-light/dark herdado do body, ou podem ser especificados se necessário */}
          <h1 className="text-4xl font-bold mb-2 text-text-main-light dark:text-text-main-dark">{anime.title}</h1>
          <p className="text-lg text-text-muted-light dark:text-text-muted-dark mb-1"><strong>Título em Japonês:</strong> {anime.title_japanese}</p>
          <p className="text-text-muted-light dark:text-text-muted-dark mb-1"><strong>Status:</strong> {anime.status}</p>
          <p className="text-text-muted-light dark:text-text-muted-dark mb-1"><strong>Episódios:</strong> {anime.episodes || 'N/A'}</p>
          <p className="text-text-muted-light dark:text-text-muted-dark mb-1"><strong>Classificação:</strong> {anime.rating || 'N/A'}</p>
          <p className="text-text-muted-light dark:text-text-muted-dark mb-4"><strong>Popularidade:</strong> #{anime.popularity}</p>

          <h2 className="text-2xl font-semibold mt-6 mb-2 text-text-main-light dark:text-text-main-dark">Sinopse</h2>
          <p className="text-text-main-light dark:text-text-main-dark leading-relaxed mb-6 whitespace-pre-wrap">{anime.synopsis || 'Sinopse não disponível.'}</p>

          {/* Controles de Watchlist */}
          {id && <WatchlistControls animeId={Number(id)} />} {/* Passar id convertido para número */}

          {streamingEpisodes.length > 0 && (
            <>
              <h2 className="text-2xl font-semibold mt-6 mb-2 text-text-main-light dark:text-text-main-dark">Assistir Agora (Exemplo)</h2>
              <ul className="list-disc list-inside mb-6">
                {streamingEpisodes.map(ep => (
                  <li key={ep.id}><a href={ep.url} target="_blank" rel="noopener noreferrer" className="text-primary-light dark:text-primary-dark hover:underline">{ep.title || `Episódio ${ep.number}`}</a></li>
                ))}
              </ul>
            </>
          )}

          <h2 className="text-2xl font-semibold mt-6 mb-2 text-text-main-light dark:text-text-main-dark">Sua Avaliação</h2>
          <StarRating />
          <textarea
            value={userOpinion}
            onChange={(e) => setUserOpinion(e.target.value)}
            placeholder="Sua opinião sobre este anime..."
            className="w-full mt-4 p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-card-light dark:bg-card-dark text-text-main-light dark:text-text-main-dark focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark outline-none min-h-[100px] resize-y transition-colors duration-150"
          />
          <button
            onClick={handleSaveRating}
            className="mt-4 bg-primary-light hover:bg-purple-700 dark:bg-primary-dark dark:hover:bg-purple-600 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-colors duration-150"
          >
            Salvar Avaliação
          </button>
          {saveStatus.message && (
            <div className={`mt-4 text-sm font-medium p-3 rounded-md transition-opacity duration-300 ${
              saveStatus.type === 'success'
                ? 'bg-green-100 text-green-700 dark:bg-green-700/30 dark:text-green-300'
                : 'bg-red-100 text-red-700 dark:bg-red-700/30 dark:text-red-300'
            } ${saveStatus.message ? 'opacity-100' : 'opacity-0'}`}>
              {saveStatus.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnimeDetailPage;
