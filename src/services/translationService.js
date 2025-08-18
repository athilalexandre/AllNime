// src/services/translationService.js
// Lightweight localization helpers for API content (no external deps)

const STATUS_MAP_PT = {
	'Finished Airing': 'Finalizado',
	'Currently Airing': 'Em exibição',
	'Not yet aired': 'Ainda não exibido',
};

const TYPE_MAP_PT = {
	TV: 'TV',
	Movie: 'Filme',
	OVA: 'OVA',
	Special: 'Especial',
	ONA: 'ONA',
	Music: 'Música',
};

const RATING_MAP_PT = {
	'G - All Ages': 'G - Todas as idades',
	'PG - Children': 'PG - Crianças',
	'PG-13 - Teens 13 or older': 'PG-13 - Maiores de 13',
	'R - 17+ (violence & profanity)': 'R - 17+ (violência e linguagem imprópria)',
	'R+ - Mild Nudity': 'R+ - Nudez leve',
	'Rx - Hentai': 'Rx - Hentai',
};

const GENRE_MAP_PT = {
	Action: 'Ação',
	Adventure: 'Aventura',
	Comedy: 'Comédia',
	Drama: 'Drama',
	Fantasy: 'Fantasia',
	Horror: 'Terror',
	Mystery: 'Mistério',
	Romance: 'Romance',
	'Sci-Fi': 'Ficção científica',
	'Slice of Life': 'Slice of Life',
	Sports: 'Esportes',
	Supernatural: 'Sobrenatural',
	Thriller: 'Suspense',
	Mecha: 'Mecha',
	Music: 'Música',
	Psychological: 'Psicológico',
	Military: 'Militar',
	Historical: 'Histórico',
	School: 'Escolar',
};

export const getEnglishTitle = (anime) => {
	if (!anime) return '';
	if (anime.title_english && anime.title_english.trim() !== '') return anime.title_english;
	if (Array.isArray(anime.titles)) {
		const en = anime.titles.find((t) => t?.type?.toLowerCase() === 'english' && t.title);
		if (en?.title) return en.title;
	}
	return anime.title || '';
};

export const localizeAnimeFields = (anime, language = 'pt') => {
	if (!anime || language !== 'pt') return anime;
	const localized = { ...anime };
	if (anime.status && STATUS_MAP_PT[anime.status]) localized.status = STATUS_MAP_PT[anime.status];
	if (anime.type && TYPE_MAP_PT[anime.type]) localized.type = TYPE_MAP_PT[anime.type];
	if (anime.rating && RATING_MAP_PT[anime.rating]) localized.rating = RATING_MAP_PT[anime.rating];
	if (Array.isArray(anime.genres)) {
		localized.genres = anime.genres.map((g) => ({ ...g, name: GENRE_MAP_PT[g.name] || g.name }));
	}
	return localized;
};

// Na prática, traduções automáticas podem falhar (CORS/limites). Mantemos como best-effort com cache.
// Função para processar sinopse e remover duplicidades de créditos
export const processSynopsis = (synopsis, language = 'pt') => {
	if (!synopsis) return { text: '', credit: '' };
	
	// Remove tags HTML
	const cleanText = synopsis.replace(/<[^>]*>?/gm, '');
	
	// Padrões de crédito em diferentes idiomas
	const creditPatterns = [
		/\[Escrito por .*?\]/i, // Português
		/\[Written by .*?\]/i,  // Inglês
		/\[Écrit par .*?\]/i,   // Francês
		/\[Escrito por .*?\]/i, // Espanhol
		/\[Geschrieben von .*?\]/i, // Alemão
		/\[Scritto da .*?\]/i,  // Italiano
		/\[書かれた .*?\]/i,     // Japonês
		/\[작성자: .*?\]/i,      // Coreano
		/\[作者: .*?\]/i,        // Chinês
	];
	
	let credit = '';
	let processedText = cleanText;
	
	// Procura por qualquer padrão de crédito
	for (const pattern of creditPatterns) {
		const match = cleanText.match(pattern);
		if (match) {
			credit = match[0];
			// Remove o crédito do texto principal
			processedText = cleanText.replace(pattern, '').trim();
			console.log(`🎯 Crédito encontrado e removido: ${credit}`);
			break;
		}
	}
	
	// Formata quebras de linha
	processedText = processedText.replace(/\n/g, '\n\n');
	
	return {
		text: processedText,
		credit: credit
	};
};

export const translateTextSafe = async (text, targetLang = 'pt') => {
	try {
		if (!text || targetLang !== 'pt') return text;
		// Unofficial Google endpoint; may fail due to CORS/quotas. Fallback returns original text.
		const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(
			text
		)}`;
		const resp = await fetch(url);
		if (!resp.ok) return text;
		const data = await resp.json();
		if (Array.isArray(data) && Array.isArray(data[0])) {
			return data[0].map((seg) => seg[0]).join('');
		}
		return text;
	} catch (_) {
		return text;
	}
};


