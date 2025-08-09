import React, { useMemo } from 'react';
import { Share2, Link as LinkIcon, Copy } from 'lucide-react';

const ShareControls = ({ anime }) => {
  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return window.location.href;
  }, []);

  const shareText = useMemo(() => {
    return anime?.title ? `Dê uma olhada em ${anime.title} no Anime Master!` : 'Confira este anime no Anime Master!';
  }, [anime?.title]);

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: anime?.title || 'Anime Master', text: shareText, url: shareUrl });
      } catch {
        // usuário cancelou ou não disponível
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('Link copiado!');
    } catch {
      // fallback: select text
      const temp = document.createElement('input');
      temp.value = shareUrl;
      document.body.appendChild(temp);
      temp.select();
      document.execCommand('copy');
      document.body.removeChild(temp);
      alert('Link copiado!');
    }
  };

  return (
    <div className="mt-6 p-4 bg-card-light dark:bg-card-dark rounded-lg shadow">
      <h3 className="text-lg font-semibold text-text-main-light dark:text-text-main-dark mb-3 flex items-center">
        <Share2 size={18} className="mr-2" /> Compartilhar
      </h3>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleNativeShare}
          className="flex items-center bg-primary-light hover:bg-opacity-80 dark:bg-primary-dark dark:hover:bg-opacity-80 text-white font-medium py-2 px-3 rounded-md transition-colors text-sm"
        >
          <Share2 size={16} className="mr-2" /> Compartilhar
        </button>
        <button
          onClick={copyToClipboard}
          className="flex items-center bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-3 rounded-md transition-colors text-sm"
        >
          <Copy size={16} className="mr-2" /> Copiar Link
        </button>
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center bg-[#1DA1F2] hover:opacity-90 text-white font-medium py-2 px-3 rounded-md transition-opacity text-sm"
        >
          <LinkIcon size={16} className="mr-2" /> Tweetar
        </a>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-3 rounded-md transition-colors text-sm"
        >
          <LinkIcon size={16} className="mr-2" /> WhatsApp
        </a>
      </div>
    </div>
  );
};

export default ShareControls;


