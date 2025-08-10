// Exemplo parcial de AnimeDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
// Mantém Jikan por ora, já que anilistService não existe no projeto base
import { getAnimeDetailsById } from '../services/jikanService';
import { getAnimeWatchInfo } from '../services/consumetService';
import { Star, Share2 } from 'lucide-react'; // Ícone de estrela e compartilhamento
import WatchlistControls from '../components/features/anime-detail/WatchlistControls'; // Adicionar import
import ShareControls from '../components/features/sharing/ShareControls';
import SharePreviewModal from '../components/features/sharing/SharePreviewModal';
import { useLanguage } from '../components/contexts/LanguageContext.jsx';
import { useShareReviewImage } from '../hooks/useShareReviewImage';
import { useTheme } from '../hooks/useTheme';

const AnimeDetailPage = () => {
  const { id } = useParams(); // id é string aqui
  const [anime, setAnime] = useState(null);
  const [streamingEpisodes, setStreamingEpisodes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [userOpinion, setUserOpinion] = useState('');
  const [saveStatus, setSaveStatus] = useState({ message: '', type: '' }); // type: 'success' ou 'error'
  const [showShareModal, setShowShareModal] = useState(false); // Estado para controlar o modal de compartilhamento
  
  // Hook para geração de imagem
  const { generatedImage, isGenerating, error: imageError, generateImage, resetImageState } = useShareReviewImage();
  
  // Hook para tema
  const { theme } = useTheme();
  
  const { translate } = useLanguage(); // Usar o hook de linguagem

  useEffect(() => {
    const fetchDetails = async () => {
      console.log('🔍 Iniciando busca de detalhes para anime ID:', id);
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('📡 Chamando Jikan API para ID:', id);
        
        // Buscar detalhes completos diretamente pelo ID
        const detailsResponse = await getAnimeDetailsById(id);
        console.log('✅ Resposta da Jikan API:', detailsResponse);
        
        if (detailsResponse?.data) {
          setAnime(detailsResponse.data);
          console.log('🎯 Anime definido no estado:', detailsResponse.data.title);

          // Buscar informações de streaming com base no título
          if (detailsResponse.data.title) {
            try {
              console.log('🌊 Buscando informações de streaming para:', detailsResponse.data.title);
              const watchInfoResponse = await getAnimeWatchInfo(detailsResponse.data.title);
              console.log('✅ Resposta da Consumet API:', watchInfoResponse);
              
              if (watchInfoResponse?.results?.[0]?.episodes) {
                setStreamingEpisodes(watchInfoResponse.results[0].episodes.slice(0, 5));
                console.log('📺 Episódios de streaming definidos:', watchInfoResponse.results[0].episodes.length);
              }
            } catch (consumetError) {
              console.warn("⚠️ Não foi possível obter links de streaming da Consumet:", consumetError);
            }
          }

          // Carregar avaliação do localStorage
          if (typeof window !== 'undefined' && window.localStorage) {
            const savedRating = localStorage.getItem(`animeRating_${id}`);
            if (savedRating) {
              const parsedRating = JSON.parse(savedRating);
              setUserRating(parsedRating.rating || 0);
              setUserOpinion(parsedRating.opinion || '');
              console.log('⭐ Avaliação carregada do localStorage:', parsedRating);
            }
          }
        } else {
          console.error('❌ Resposta da API não contém dados válidos:', detailsResponse);
          setError('Resposta da API inválida');
        }

      } catch (err) {
        console.error("❌ Erro ao buscar detalhes do anime:", err);
        
        // Verificar se é um erro de ID não encontrado
        if (err.message.includes('não foi encontrado') || err.message.includes('não existe')) {
          setError(translate('Este anime não foi encontrado na base de dados.'));
        } else {
          setError(translate('Não foi possível carregar os detalhes do anime.'));
        }
      } finally {
        setIsLoading(false);
        console.log('🏁 Busca de detalhes concluída');
      }
    };
    
    if (id) {
      fetchDetails();
    }
  }, [id, translate]); // Adicionar translate às dependências

  const handleSaveRating = () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const ratingData = { rating: userRating, opinion: userOpinion };
      localStorage.setItem(`animeRating_${id}`, JSON.stringify(ratingData));
      setSaveStatus({ message: translate('Avaliação salva com sucesso!'), type: 'success' });
    } else {
      console.warn("localStorage não disponível para salvar avaliação.");
      setSaveStatus({ message: translate('LocalStorage não disponível. Avaliação não pôde ser salva.'), type: 'error' });
    }
    setTimeout(() => {
      setSaveStatus({ message: '', type: '' });
    }, 3000);
  };

  const handleRemoveRating = () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(`animeRating_${id}`);
      setUserRating(0);
      setUserOpinion('');
      setSaveStatus({ message: translate('Avaliação removida com sucesso!'), type: 'success' });
    } else {
      console.warn("localStorage não disponível para remover avaliação.");
      setSaveStatus({ message: translate('LocalStorage não disponível. Avaliação não pôde ser removida.'), type: 'error' });
    }
    setTimeout(() => {
      setSaveStatus({ message: '', type: '' });
    }, 3000);
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

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 pt-20 text-center text-text-light dark:text-text-dark">
        {translate('Carregando detalhes do anime...')}
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 pt-20 text-center">
        <div className="max-w-md mx-auto">
          <div className="text-6xl mb-4">😔</div>
          <h1 className="text-2xl font-bold text-text-light dark:text-text-dark mb-4">
            {translate('Anime não encontrado')}
          </h1>
          <p className="text-text-muted-light dark:text-text-muted-dark mb-6">
            {translate('O anime que você está procurando não foi encontrado na base de dados.')}
          </p>
          <div className="space-y-3">
            <Link 
              to="/" 
              className="block w-full bg-primary-light dark:bg-primary-dark text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity"
            >
              {translate('Voltar para a busca')}
            </Link>
            <Link 
              to="/explore" 
              className="block w-full bg-accent-light dark:bg-accent-dark text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity"
            >
              {translate('Explorar outros animes')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!anime) {
    return (
      <div className="container mx-auto p-4 pt-20 text-center">
        <div className="max-w-md mx-auto">
          <div className="text-6xl mb-4">🤔</div>
          <h1 className="text-2xl font-bold text-text-light dark:text-text-dark mb-4">
            {translate('Anime não disponível')}
          </h1>
          <p className="text-text-muted-light dark:text-text-muted-dark mb-6">
            {translate('Não foi possível carregar as informações deste anime.')}
          </p>
          <div className="space-y-3">
            <Link 
              to="/" 
              className="block w-full bg-primary-light dark:bg-primary-dark text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity"
            >
              {translate('Voltar para a busca')}
            </Link>
            <Link 
              to="/explore" 
              className="block w-full bg-accent-light dark:bg-accent-dark text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity"
            >
              {translate('Explorar outros animes')}
            </Link>
          </div>
        </div>
      </div>
    );
  }


  const displayImage = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || '';
  const displayTitle = anime.title || 'N/A';
  const displayJapaneseTitle = anime.title_japanese || 'N/A';
  const cleanSynopsis = anime.synopsis ? anime.synopsis.replace(/<[^>]*>?/gm, '') : 'N/A';
  const displaySynopsis = cleanSynopsis.replace(/\n/g, '\n\n');
  const displayClassification = anime.rating || 'N/A';
  const displayPopularity = anime.popularity ? `#${anime.popularity}` : 'N/A';
  const displayTrailerId = anime.trailer?.youtube_id;
  const displayExternalLinks = anime.external || [];

  return (
    <div className="container mx-auto p-4 pt-20 text-text-light dark:text-text-dark">
      <Link to="/" className="text-primary-light dark:text-primary-dark hover:underline mb-4 inline-block">
        &larr; {translate('Voltar para a busca')}
      </Link>

      {/* Banner Image */}
      {anime.bannerImage && (
        <div className="relative w-full h-64 sm:h-80 md:h-96 rounded-lg overflow-hidden mb-8 shadow-xl">
          <img
            src={anime.bannerImage}
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
              onError={(e) => {
                e.target.onerror = null; // Evita loop de erro
                e.target.src = 'https://placehold.co/250x350/F0F0F0/333333?text=No+Image'; // Fallback image
              }}
            />
          )}
        </div>

        {/* Anime Details */}
        <div className="flex-grow">
          <h1 className="text-4xl font-extrabold mb-2 text-primary-light dark:text-primary-dark">
            {displayTitle}
          </h1>
          {/* Controles de Compartilhamento */}
          <ShareControls anime={anime} />

          <div className="text-lg text-text-muted-light dark:text-text-muted-dark mb-4 space-y-1">
            {displayJapaneseTitle && (<p><strong>{translate('Título em Japonês:')}</strong> {displayJapaneseTitle}</p>)}
            {anime.status && (<p><strong>{translate('Status:')}</strong> {anime.status}</p>)}
            {anime.episodes && (<p><strong>{translate('Episódios:')}</strong> {anime.episodes}</p>)}
            {displayClassification && (<p><strong>{translate('Classificação:')}</strong> {displayClassification}</p>)}
            {displayPopularity && (<p><strong>{translate('Popularidade:')}</strong> {displayPopularity}</p>)}
          </div>

          <h2 className="text-2xl font-semibold mt-6 mb-2 text-text-light dark:text-text-dark">{translate('Sinopse')}</h2>
          <p className="text-text-muted-light dark:text-text-muted-dark mb-6 leading-relaxed whitespace-pre-wrap">
            {displaySynopsis}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 mb-6 text-sm">
            {anime.type && (
              <div>
                <span className="font-semibold">{translate('Tipo:')} </span>
                {anime.type}
              </div>
            )}
            {anime.duration && (
              <div>
                <span className="font-semibold">{translate('Duração por Ep.:')} </span>
                {anime.duration}
              </div>
            )}
            {anime.genres && anime.genres.length > 0 && (
              <div>
                <span className="font-semibold">{translate('Gêneros:')} </span>
                {anime.genres.map(g => g.name).join(', ')}
              </div>
            )}
            {anime.studios && anime.studios.length > 0 && (
              <div>
                <span className="font-semibold">{translate('Estúdios:')} </span>
                {anime.studios.map(s => s.name).join(', ')}
              </div>
            )}
          </div>

          {/* Controles da Watchlist */}
          {id && <WatchlistControls animeId={Number(id)} />}

          {/* Seção de Avaliação do Usuário */}
          <div className="bg-card-light dark:bg-card-dark p-6 rounded-lg shadow-md mt-8">
            <h2 className="text-2xl font-bold mb-4">{translate('Sua Avaliação')}</h2>
            <div className="flex items-center mb-4">
              {renderStars(userRating)}
              <span className="ml-4 text-xl font-semibold">
                {userRating > 0 ? `${userRating}/5` : translate('Não Avaliado')}
              </span>
            </div>
            <textarea
              className="w-full p-3 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark mb-4"
              rows="4"
              placeholder={translate('Sua opinião sobre este anime...')}
              value={userOpinion}
              onChange={(e) => setUserOpinion(e.target.value)}
            ></textarea>
            {saveStatus.message && (
              <p className={`text-sm ${saveStatus.type === 'success' ? 'text-green-500' : 'text-red-500'} mt-2`}>
                {saveStatus.message}
              </p>
            )}
            <div className="flex space-x-2">
              <button
                onClick={handleSaveRating}
                className="px-4 py-2 bg-primary-light text-white rounded-md hover:bg-primary-dark transition-colors"
              >
                {translate('Salvar Avaliação')}
              </button>
              {userRating > 0 && (
                <button
                  onClick={handleRemoveRating}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                >
                  {translate('Remover Avaliação')}
                </button>
              )}
            </div>
          </div>

          {/* Seção de Trailer (se disponível) */}
          {displayTrailerId && (
            <div className="mt-8">
              <h2 className="text-2xl font-semibold mb-4 text-text-light dark:text-text-dark">{translate('Trailer')}</h2>
              <div className="relative aspect-video w-full rounded-lg overflow-hidden shadow-lg">
                <iframe
                  src={`https://www.youtube.com/embed/${displayTrailerId}`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute top-0 left-0 w-full h-full"
                ></iframe>
            </div>
          </div>
          )}

          {/* Seção de Links Externos */}
          {displayExternalLinks.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-semibold mb-4 text-text-light dark:text-text-dark">{translate('Links Externos')}</h2>
              <div className="flex flex-wrap gap-3">
                {displayExternalLinks.map((link, index) => (
                  <a
                    key={index} // Considerar usar um id único se disponível no futuro
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-accent-light dark:bg-accent-dark text-white rounded-md hover:opacity-90 transition-opacity text-sm"
                  >
                    {link.site}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Seção de Episódios de Streaming (Consumet) */}
          {streamingEpisodes.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-semibold mb-4 text-text-light dark:text-text-dark">{translate('Episódios para Assistir')}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {streamingEpisodes.map(episode => (
                  <a
                    key={episode.id} // Certifique-se de que episode.id é único
                    href={episode.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 bg-card-light dark:bg-card-dark rounded-lg shadow hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-center"
                  >
                    <p className="font-semibold text-primary-light dark:text-primary-dark">{episode.title || `${translate('Episódio')} ${episode.number}`}</p>
                    <p className="text-sm text-text-muted-light dark:text-text-muted-dark">{translate('Número:')} {episode.number}</p>
                  </a>
                ))}
              </div>
            </div>
          )}

          {userRating > 0 && typeof window !== 'undefined' && window.localStorage && localStorage.getItem(`animeRating_${id}`) && ( // Só mostrar se houver avaliação salva
            <div className="mt-6 pt-6 border-t border-gray-300 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-text-main-light dark:text-text-main-dark mb-3">
                Compartilhar Avaliação
              </h3>
              <button
                onClick={() => {
                  setShowShareModal(true);
                  resetImageState(); // Limpar imagem/erros ao abrir
                }}
                disabled={isGenerating}
                className="w-full flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors duration-150 disabled:opacity-50"
              >
                <Share2 size={18} className="mr-2" />
                {isGenerating ? 'Gerando Imagem...' : 'Criar Imagem para Compartilhar'}
              </button>
              {imageError && <p className="text-sm text-red-500 mt-2">{imageError}</p>}
            </div>
          )}

          {/* Modal de Compartilhamento */}
          {showShareModal && anime && (userRating > 0) && (
            <SharePreviewModal
              isOpen={showShareModal}
              onClose={() => {
                setShowShareModal(false);
                resetImageState(); // Limpar imagem/erros ao fechar
              }}
              animeDetails={anime}
              userReview={{ rating: userRating, opinion: userOpinion }} // Passar dados atuais
              currentTheme={theme}
              generatedImage={generatedImage}
              isGenerating={isGenerating}
              imageError={imageError}
              onGenerateImage={generateImage} // Passa a função generateImage do hook useShareReviewImage
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AnimeDetailPage;
