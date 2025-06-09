// src/components/features/sharing/ShareableReviewCard.jsx
import React from 'react';
import { Star } from 'lucide-react'; // Reutilizar o ícone de estrela

const ShareableReviewCard = React.forwardRef(({ animeDetails, userReview, currentTheme }, ref) => {
  // Adicionado currentTheme como prop para aplicar estilos de fundo e texto explicitamente
  // já que html2canvas pode não capturar o tema do <html> corretamente em todos os cenários.

  if (!animeDetails || !userReview) {
    return (
        <div
            ref={ref}
            className="w-[400px] h-[300px] flex items-center justify-center text-gray-400 border border-gray-300 rounded-xl shadow-2xl"
            style={{ backgroundColor: currentTheme === 'dark' ? '#1F2937' : '#FFFFFF' }} // Fundo explícito
        >
            Carregando dados da avaliação...
        </div>
    );
  }

  const { title, images } = animeDetails;
  const { rating, opinion } = userReview;

  const maxOpinionLength = 150;
  const truncatedOpinion = opinion && opinion.length > maxOpinionLength
    ? `${opinion.substring(0, maxOpinionLength)}...`
    : opinion;

  const renderStars = (currentRating) => {
    const totalStars = 5;
    let stars = [];
    for (let i = 1; i <= totalStars; i++) {
      stars.push(
        <Star
          key={i}
          size={24}
          // Aplicar cores explícitas para estrelas com base no tema e rating
          fill={currentRating >= i ? '#FFC107' : (currentTheme === 'dark' ? '#4B5563' : '#E5E7EB')} // fill-yellow-400 or fill-gray-500/300
          stroke={currentRating >= i ? '#FFC107' : (currentTheme === 'dark' ? '#6B7280' : '#D1D5DB')} // text-yellow-400 or text-gray-500/400
          className={currentRating >= i ? '' : ''} // Remover classes de cor Tailwind para não conflitarem com fill/stroke SVG
        />
      );
    }
    return <div className="flex justify-center my-3">{stars}</div>; // Ajustado my-2 para my-3
  };

  // Define cores explícitas para texto com base no tema
  const textColor = currentTheme === 'dark' ? '#F3F4F6' : '#1F2937'; // text-main-dark / text-main-light
  const mutedTextColor = currentTheme === 'dark' ? '#9CA3AF' : '#6B7280'; // text-muted-dark / text-muted-light
  const primaryColor = currentTheme === 'dark' ? '#8B5CF6' : '#6D28D9'; // primary-dark / primary-light
  const opinionBgColor = currentTheme === 'dark' ? '#374151' : '#F9FAFB'; // gray-700 (um pouco mais escuro que card-dark) / gray-50

  return (
    <div
      ref={ref}
      className="w-[400px] p-6 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 font-sans"
      style={{
        backgroundColor: currentTheme === 'dark' ? '#1F2937' : '#FFFFFF', // card-dark / card-light
        color: textColor,
        // Adicionar um box-sizing para garantir que padding e border não aumentem o tamanho final da imagem
        boxSizing: 'border-box',
      }}
    >
      {images?.jpg?.large_image_url ? (
        <img
          src={images.jpg.large_image_url}
          alt={`Capa de ${title}`}
          className="w-full h-48 object-cover rounded-lg mb-4 shadow-md"
          crossOrigin="anonymous"
        />
      ) : (
        <div
          className="w-full h-48 rounded-lg mb-4 shadow-md flex items-center justify-center"
          style={{ backgroundColor: currentTheme === 'dark' ? '#374151' : '#E5E7EB' }} // gray-700 / gray-200
        >
          <span style={{ color: mutedTextColor }}>Sem Imagem</span>
        </div>
      )}

      <h2
        className="text-2xl font-bold text-center mb-2 truncate"
        title={title}
        style={{ color: primaryColor }}
      >
        {title || 'Título do Anime'}
      </h2>

      {renderStars(rating)}

      {truncatedOpinion ? (
        <p
          className="text-sm text-center italic my-3 p-3 rounded-md shadow-inner"
          style={{ backgroundColor: opinionBgColor, color: textColor }}
        >
          "{truncatedOpinion}"
        </p>
      ) : (
         <p
            className="text-sm text-center italic my-3 p-3"
            style={{ color: mutedTextColor }}
         >
          Nenhuma opinião fornecida.
        </p>
      )}

      <div className="mt-4 text-center">
        <p className="text-xs" style={{ color: mutedTextColor }}>
          Avaliado com <span className="font-bold" style={{ color: primaryColor }}>Anime Master</span>
        </p>
      </div>
    </div>
  );
});

ShareableReviewCard.displayName = 'ShareableReviewCard';

export default ShareableReviewCard;
