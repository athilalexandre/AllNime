import { GraphQLClient, gql } from 'graphql-request';

const endpoint = 'https://graphql.anilist.co';
const client = new GraphQLClient(endpoint);

export async function searchAnimesAniList(query) {
  const SEARCH_QUERY = gql`
    query ($search: String) {
      Page(perPage: 10) {
        media(search: $search, type: ANIME) {
          id
          title {
            romaji
            native
          }
          coverImage {
            large
          }
          averageScore
          episodes
          format
          status
          seasonYear
        }
      }
    }
  `;
  const variables = { search: query };
  const data = await client.request(SEARCH_QUERY, variables);
  return data.Page.media;
} 