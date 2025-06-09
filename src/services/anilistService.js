import { GraphQLClient, gql } from 'graphql-request';

const endpoint = 'https://graphql.anilist.co';
const client = new GraphQLClient(endpoint);

export async function searchAnimesAniList(query, page = 1, perPage = 10) {
  const SEARCH_QUERY = gql`
    query ($search: String, $page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo {
          total
          currentPage
          lastPage
          hasNextPage
          perPage
        }
        media(search: $search, type: ANIME) {
          id
          title {
            romaji
            english
            native
          }
          coverImage {
            large
            medium
          }
          bannerImage
          averageScore
          episodes
          format
          status
          seasonYear
          description(asHtml: false)
          genres
          duration
          source
          startDate {
            year
            month
            day
          }
          endDate {
            year
            month
            day
          }
          studios(isMain: true) {
            nodes {
              name
            }
          }
          externalLinks {
            site
            url
          }
          trailer {
            id
            site
            thumbnail
          }
        }
      }
    }
  `;
  const variables = { search: query, page, perPage };
  const data = await client.request(SEARCH_QUERY, variables);
  return data.Page;
}

export async function getAnimeDetailsAniList(id) {
  const ANIME_DETAILS_QUERY = gql`
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        id
        title {
          romaji
          english
          native
        }
        coverImage {
          large
          medium
        }
        bannerImage
        averageScore
        episodes
        format
        status
        seasonYear
        description(asHtml: false)
        genres
        duration
        source
        startDate {
          year
          month
          day
        }
        endDate {
          year
          month
          day
        }
        studios(isMain: true) {
          nodes {
            name
          }
        }
        externalLinks {
          site
          url
        }
        trailer {
          id
          site
          thumbnail
        }
      }
    }
  `;
  const variables = { id: parseInt(id) };
  const data = await client.request(ANIME_DETAILS_QUERY, variables);
  return data.Media;
}

export async function getSeasonalAnimesAniList(season, seasonYear, page = 1, perPage = 10) {
  const SEASONAL_QUERY = gql`
    query ($season: MediaSeason, $seasonYear: Int, $page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo {
          total
          currentPage
          lastPage
          hasNextPage
          perPage
        }
        media(
          season: $season
          seasonYear: $seasonYear
          type: ANIME
          sort: POPULARITY_DESC
          isAdult: false
        ) {
          id
          title {
            romaji
            english
          }
          coverImage {
            large
            medium
          }
        }
      }
    }
  `;
  const variables = { season, seasonYear, page, perPage };
  const data = await client.request(SEASONAL_QUERY, variables);
  return data.Page;
}

export async function getTopAnimesAniList(page = 1, perPage = 10) {
  const TOP_QUERY = gql`
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo {
          total
          currentPage
          lastPage
          hasNextPage
          perPage
        }
        media(type: ANIME, sort: SCORE_DESC, isAdult: false) {
          id
          title {
            romaji
            english
          }
          coverImage {
            large
            medium
          }
        }
      }
    }
  `;
  const variables = { page, perPage };
  const data = await client.request(TOP_QUERY, variables);
  return data.Page;
} 