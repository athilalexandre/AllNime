import axios from 'axios';

// ATENÇÃO: A URL base da Consumet pode mudar. Verifique a documentação oficial.
// Esta URL é um exemplo e pode não ser a mais estável ou oficial.
const CONSUMET_API_BASE_URL = 'https://consumet-api-production-host.vercel.app'; // Exemplo, pode ser api.consumet.org ou outro host
                                                                            // Usei um que costuma funcionar, mas o oficial é 'api.consumet.org' que as vezes está offline.

export const getAnimeWatchInfo = async (animeTitle) => {
  if (!animeTitle) return Promise.resolve(null);
  try {
    // A Consumet geralmente pesquisa pelo título na Gogoanime ou outros provedores.
    // O endpoint /meta/anilist/{query} também pode ser uma alternativa para buscar pelo título e obter IDs do Anilist,
    // que depois podem ser usados em outros endpoints da Consumet se necessário.
    // Vamos tentar com /anime/gogoanime/{query} que é mais direto para Gogoanime.
    const response = await axios.get(`${CONSUMET_API_BASE_URL}/anime/gogoanime/${encodeURIComponent(animeTitle)}`, {
      params: { page: 1 } // Pegar a primeira página de resultados
    });
    // A API retorna uma lista de resultados. O primeiro geralmente é o mais relevante.
    // A estrutura exata da resposta precisa ser verificada na documentação ou testando.
    // Ex: response.data.results pode ser a lista.
    // Se response.data.results[0].id existir, esse ID pode ser usado para buscar mais infos ou episódios.
    // Ex: `${CONSUMET_API_BASE_URL}/anime/gogoanime/info/${response.data.results[0].id}`
    // Esta função retornará a lista de resultados da busca por título.
    // A lógica de pegar episódios pode ser adicionada aqui ou no componente.
    return response.data; // Espera-se que response.data.results seja um array
  } catch (error) {
    // É comum a Consumet não encontrar um anime ou o serviço estar instável.
    console.warn(`Consumet API: Não foi possível encontrar informações de streaming para "${animeTitle}":`, error.response?.data || error.message);
    // Não tratar como erro fatal para a aplicação, apenas logar.
    return null; // Retornar null para indicar que não encontrou ou falhou.
  }
};

// Função exemplo se precisássemos buscar episódios com um ID da Consumet
// export const getConsumetAnimeEpisodes = async (consumetAnimeId) => {
//   try {
//     const response = await axios.get(`${CONSUMET_API_BASE_URL}/anime/gogoanime/info/${consumetAnimeId}`);
//     return response.data.episodes; // Supondo que a resposta tenha um array 'episodes'
//   } catch (error) {
//     console.error(`Consumet API: Erro ao buscar episódios para o ID ${consumetAnimeId}:`, error);
//     return [];
//   }
// };
