// src/hooks/useShareReviewImage.js
import { useState, useCallback } from 'react';
import html2canvas from 'html2canvas'; // Esta importação falhará se o pacote não estiver instalado

export const useShareReviewImage = () => {
  const [generatedImage, setGeneratedImage] = useState(null); // Armazenará a dataURL da imagem
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generateImage = useCallback(async (elementToCapture) => {
    if (typeof html2canvas === 'undefined') {
        const installErrorMsg = 'Biblioteca html2canvas não está disponível. Instalação falhou ou está pendente.';
        console.error(installErrorMsg);
        setError(installErrorMsg);
        setIsGenerating(false); // Certifique-se de resetar o estado de geração
        return null;
    }

    if (!elementToCapture) {
      setError('Elemento para captura não fornecido.');
      console.error('Elemento para captura não fornecido para html2canvas.');
      setIsGenerating(false); // Certifique-se de resetar o estado de geração
      return null;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);

    try {
      // Opções para html2canvas para melhor qualidade e para lidar com cross-origin
      const canvas = await html2canvas(elementToCapture, {
        allowTaint: true,       // Permite imagens de outras origens (requer crossOrigin="anonymous" na tag img)
        useCORS: true,          // Tenta usar CORS para carregar imagens
        logging: false,         // Desabilitar logs do html2canvas no console
        scale: 2,               // Aumentar a escala para melhor resolução da imagem
        backgroundColor: null,  // Usar o fundo do elemento, ou definir um se necessário
        // scrollX: 0, // Resetar scroll para evitar problemas de captura de viewport
        // scrollY: 0,
        // windowWidth: document.documentElement.offsetWidth, // Usar documentElement para largura total
        // windowHeight: document.documentElement.offsetHeight, // Usar documentElement para altura total
      });
      const imageDataUrl = canvas.toDataURL('image/png');
      setGeneratedImage(imageDataUrl);
      setIsGenerating(false);
      return imageDataUrl;
    } catch (err) {
      console.error('Erro ao gerar imagem com html2canvas:', err);
      setError('Falha ao gerar a imagem para compartilhamento.');
      setIsGenerating(false);
      return null;
    }
  }, []);

  const resetImageState = useCallback(() => {
    setGeneratedImage(null);
    setIsGenerating(false);
    setError(null);
  }, []);

  return {
    generatedImage,
    isGenerating,
    error,
    generateImage,
    resetImageState,
  };
};
