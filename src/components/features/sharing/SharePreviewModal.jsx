// src/components/features/sharing/SharePreviewModal.jsx
import React, { useEffect, useRef } from 'react';
import ShareableReviewCard from './ShareableReviewCard';
import { X, Download, Twitter, Share2, Loader2 } from 'lucide-react';

const SharePreviewModal = ({
  isOpen,
  onClose,
  animeDetails,
  userReview,
  currentTheme,
  generatedImage,
  isGenerating,
  imageError,
  onGenerateImage // Função que chama generateImage(ref) do hook
}) => {
  const cardToCaptureRef = useRef(null);

  useEffect(() => {
    // Gera a imagem quando o modal abre, o card está referenciado,
    // e ainda não temos uma imagem, nem estamos gerando, nem temos um erro.
    if (isOpen && cardToCaptureRef.current && !generatedImage && !isGenerating && !imageError) {
      onGenerateImage(cardToCaptureRef.current);
    }
  }, [isOpen, generatedImage, isGenerating, imageError, onGenerateImage, animeDetails, userReview, currentTheme]);
  // Adicionado animeDetails, userReview, currentTheme às dependências para garantir que
  // se o modal permanecer aberto e esses dados mudarem (improvável neste fluxo, mas bom para robustez),
  // uma nova imagem possa ser considerada para geração.

  if (!isOpen) {
    return null;
  }

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `anime-master-review-${animeDetails?.title?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'share'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleTwitterShare = () => {
    if (!animeDetails || !userReview) return;
    const text = encodeURIComponent(
      `Confira minha avaliação de ${animeDetails.title}! Nota: ${userReview.rating}/5. ${userReview.opinion ? `Opinião: "${userReview.opinion.substring(0,50)}..." ` : ''}#AnimeMaster #${animeDetails.title?.replace(/\s+/g, '')}`
    );
    const twitterUrl = `https://twitter.com/intent/tweet?text=${text}`;
    window.open(twitterUrl, '_blank', 'noopener,noreferrer');
  };

  const handleWebShare = async () => {
    if (!generatedImage || typeof window === 'undefined' || !navigator.share) return;
    try {
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      const file = new File([blob], `anime-master-review-${animeDetails?.title?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'share'}.png`, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Minha avaliação de ${animeDetails.title}`,
          text: `Confira minha avaliação de ${animeDetails.title} (${userReview.rating}/5) feita no Anime Master!`,
        });
      } else {
        alert("Seu navegador não suporta compartilhar esta imagem diretamente. Tente baixar a imagem e compartilhar manualmente.");
      }
    } catch (error) {
      if (error.response && error.response.status === 429) {
        alert('Você fez muitas requisições à API. Por favor, aguarde um pouco e tente novamente.');
      }
      console.error('Erro ao usar Web Share API:', error);
      alert('Erro ao tentar compartilhar. Tente baixar a imagem.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[100] backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-card-light dark:bg-card-dark rounded-xl shadow-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()} // Impede que o clique dentro do modal o feche
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full text-text-muted-light dark:text-text-muted-dark hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label="Fechar modal"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-text-main-light dark:text-text-main-dark mb-4 text-center">
          Compartilhar Avaliação
        </h2>

        {/* Este div é para renderizar o ShareableReviewCard APENAS para captura, oculto da visão principal do modal */}
        {/* Ele é necessário no DOM para que html2canvas possa capturá-lo */}
        {isOpen && !generatedImage && !isGenerating && !imageError && (
             <div className="absolute -left-[9999px] -top-[9999px] opacity-0 pointer-events-none">
                 <ShareableReviewCard
                     ref={cardToCaptureRef}
                     animeDetails={animeDetails}
                     userReview={userReview}
                     currentTheme={currentTheme}
                 />
             </div>
         )}

        {isGenerating && (
          <div className="my-8 flex flex-col items-center justify-center text-center min-h-[200px]">
            <Loader2 size={48} className="animate-spin text-primary-light dark:text-primary-dark mb-3" />
            <p className="text-text-muted-light dark:text-text-muted-dark">Gerando sua imagem...</p>
          </div>
        )}

        {imageError && !isGenerating && (
          <div className="my-8 text-center p-4 bg-red-100 dark:bg-red-700/30 rounded-md min-h-[200px] flex flex-col justify-center">
            <p className="text-red-700 dark:text-red-300 font-medium">Erro ao gerar imagem:</p>
            <p className="text-red-600 dark:text-red-400 text-sm">{imageError}</p>
            <button
              onClick={() => onGenerateImage(cardToCaptureRef.current)}
              className="mt-4 px-4 py-2 bg-primary-light text-white rounded-md hover:bg-opacity-80 text-sm"
            >
              Tentar Novamente
            </button>
          </div>
        )}

        {generatedImage && !isGenerating && (
          <div className="my-4">
            <img src={generatedImage} alt="Prévia da avaliação gerada" className="rounded-lg shadow-md mx-auto border border-gray-300 dark:border-gray-600 max-w-full" />
          </div>
        )}

        {generatedImage && !isGenerating && (
          <div className="mt-6 space-y-3">
            <button
              onClick={handleDownload}
              className="w-full flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-4 rounded-lg shadow-md transition-colors"
            >
              <Download size={18} className="mr-2" /> Baixar Imagem
            </button>
            <button
              onClick={handleTwitterShare}
              className="w-full flex items-center justify-center bg-[#1DA1F2] hover:bg-[#1A91DA] text-white font-bold py-2.5 px-4 rounded-lg shadow-md transition-colors"
            >
              <Twitter size={18} className="mr-2" /> Compartilhar no Twitter
            </button>
            {typeof window !== 'undefined' && navigator.share && navigator.canShare && (
              <button
                onClick={handleWebShare}
                className="w-full flex items-center justify-center bg-gray-600 hover:bg-gray-700 text-white font-bold py-2.5 px-4 rounded-lg shadow-md transition-colors"
              >
                <Share2  size={18} className="mr-2" /> Compartilhar (Nativo)
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
export default SharePreviewModal;
