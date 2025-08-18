// Exemplo parcial de AnimeDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
// Mantém Jikan por ora, já que anilistService não existe no projeto base
import { getAnimeDetailsById } from '../services/jikanService';
import { getAnimeWatchInfo } from '../services/consumetService';
import { Star, Share2 } from 'lucide-react'; // Ícone de estrela e compartilhamento
import { useLanguage } from '../components/contexts/LanguageContext';
import { getEnglishTitle, localizeAnimeFields, translateTextSafe, processSynopsis } from '../services/translationService';
import WatchlistControls from '../components/features/anime-detail/WatchlistControls'; // Adicionar import
import ShareControls from '../components/features/sharing/ShareControls';
import SharePreviewModal from '../components/features/sharing/SharePreviewModal';
import { useShareReviewImage } from '../hooks/useShareReviewImage';
import { useTheme } from '../hooks/useTheme';
import AdultContentWarning from '../components/ui/AdultContentWarning';
import { useAdultContent } from '../hooks/useAdultContent';

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
  
  const { translate, language } = useLanguage(); // Usar o hook de linguagem
  const { canAccess, checkAccessWithNotification } = useAdultContent();

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
          // Localize fields when in PT, and prefer English title for EN
          const base = detailsResponse.data;
          const localized = localizeAnimeFields(base, language);
          // Best-effort translate synopsis to PT only, keep EN as original
          if (language === 'pt' && localized?.synopsis) {
            localized.synopsis = await translateTextSafe(localized.synopsis, 'pt');
          }
          setAnime(localized);
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
        } else if (err.message.includes('API temporariamente indisponível')) {
          setError(translate('API temporariamente indisponível. Tente novamente em alguns minutos.'));
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
  }, [id, translate, language]); // Adicionar translate às dependências

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
  const displayTitle = language === 'en' ? getEnglishTitle(anime) || anime.title || 'N/A' : (anime.title || getEnglishTitle(anime) || 'N/A');
  const displayJapaneseTitle = anime.title_japanese || 'N/A';
  // Processa a sinopse globalmente para todas as linguagens
  const { text: displaySynopsis, credit: synopsisCredit } = processSynopsis(anime.synopsis, language);
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

          {/* Informações Principais */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 mb-6 border border-blue-200 dark:border-blue-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayJapaneseTitle && (
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 dark:text-blue-400 text-sm font-bold">日</span>
                  </div>
                  <div>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium uppercase tracking-wide">{translate('Título em Japonês')}</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{displayJapaneseTitle}</p>
                  </div>
                </div>
              )}
              
              {anime.status && (
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 dark:text-green-400 text-sm">●</span>
                  </div>
                  <div>
                    <p className="text-xs text-green-600 dark:text-green-400 font-medium uppercase tracking-wide">{translate('Status')}</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{anime.status}</p>
                  </div>
                </div>
              )}
              
              {anime.episodes && (
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600 dark:text-purple-400 text-sm font-bold">EP</span>
                  </div>
                  <div>
                    <p className="text-xs text-purple-600 dark:text-purple-400 font-medium uppercase tracking-wide">{translate('Episódios')}</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{anime.episodes}</p>
                  </div>
                </div>
              )}
              
              {displayClassification && (
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                    <span className="text-orange-600 dark:text-orange-400 text-sm font-bold">18</span>
                  </div>
                  <div>
                    <p className="text-xs text-orange-600 dark:text-orange-400 font-medium uppercase tracking-wide">{translate('Classificação')}</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{displayClassification}</p>
                  </div>
                </div>
              )}
              
              {displayPopularity && (
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-pink-100 dark:bg-pink-900 rounded-lg flex items-center justify-center">
                    <span className="text-pink-600 dark:text-pink-400 text-sm font-bold">🔥</span>
                  </div>
                  <div>
                    <p className="text-xs text-pink-600 dark:text-pink-400 font-medium uppercase tracking-wide">{translate('Popularidade')}</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{displayPopularity}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

                     {/* Sinopse */}
           <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-8 mb-6 border border-gray-200 dark:border-gray-700 shadow-lg">
             <div className="flex items-center space-x-4 mb-6">
               <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                 <span className="text-white text-lg">📖</span>
               </div>
               <div>
                 <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{translate('Sinopse')}</h2>
                 <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">História e enredo do anime</p>
               </div>
             </div>
             
             <div className="bg-white dark:bg-gray-800 rounded-lg p-8 border border-gray-100 dark:border-gray-700 shadow-sm">
               <article className="historia-sinopse">
                 <div className="text-gray-700 dark:text-gray-300 leading-relaxed space-y-6">
                   {displaySynopsis.split('\n\n').map((paragraph, index) => {
                     if (!paragraph.trim()) return null;
                     
                     // Quebrar parágrafos longos em blocos menores
                     const sentences = paragraph.trim().split(/[.!?]+/).filter(s => s.trim());
                     const chunks = [];
                     let currentChunk = '';
                     
                     sentences.forEach(sentence => {
                       const trimmedSentence = sentence.trim();
                       if (!trimmedSentence) return;
                       
                       if ((currentChunk + trimmedSentence).length > 200) {
                         if (currentChunk) chunks.push(currentChunk.trim());
                         currentChunk = trimmedSentence;
                       } else {
                         currentChunk += (currentChunk ? '. ' : '') + trimmedSentence;
                       }
                     });
                     
                     if (currentChunk) chunks.push(currentChunk.trim());
                     
                     return chunks.map((chunk, chunkIndex) => (
                       <div key={`${index}-${chunkIndex}`} className="sinopse-paragraph">
                         <p className="text-base leading-7 text-gray-700 dark:text-gray-300 mb-4">
                           {chunk}
                         </p>
                       </div>
                     ));
                   })}
                 </div>
                 
                                   {/* Indicador de fonte se disponível */}
                  {synopsisCredit && (
                    <footer className="creditos-sinopse">
                      <p className="text-sm text-gray-500 dark:text-gray-400 italic text-right">
                        {synopsisCredit}
                      </p>
                    </footer>
                  )}
               </article>
             </div>
           </div>

          {/* Informações Técnicas */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 mb-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">⚙️</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{translate('Informações Técnicas')}</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {anime.type && (
                <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{translate('Tipo')}</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{anime.type}</span>
                </div>
              )}
              
              {anime.duration && (
                <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{translate('Duração por Ep.')}</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{anime.duration}</span>
                </div>
              )}
              
              {anime.genres && anime.genres.length > 0 && (
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{translate('Gêneros')}</span>
                    <div className="flex flex-wrap gap-2">
                      {anime.genres.map((g, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium rounded-full">
                          {g.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {anime.studios && anime.studios.length > 0 && (
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{translate('Estúdios')}</span>
                    <div className="flex flex-wrap gap-2">
                      {anime.studios.map((s, index) => (
                        <span key={index} className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-medium rounded-full">
                          {s.name}
                        </span>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Controles da Watchlist */}
          {id && <WatchlistControls animeId={Number(id)} />}

          {/* Aviso de Conteúdo Adulto */}
          {anime && anime.genres && anime.genres.some(genre => 
            ['Hentai', 'Ecchi', 'Yuri', 'Yaoi', 'Harem'].some(adultGenre => 
              genre.name && genre.name.toLowerCase().includes(adultGenre.toLowerCase())
            )
          ) && (
            <div className="mt-6">
              <AdultContentWarning
                title="Conteúdo Adulto Detectado"
                message="Este anime contém conteúdo que pode não ser adequado para menores de 18 anos."
                showDetails={true}
                onAction={() => {
                  if (!canAccess()) {
                    checkAccessWithNotification(anime.title);
                  }
                }}
                actionText="Verificar Acesso"
              />
            </div>
          )}

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
