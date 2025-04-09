import { gql } from '@apollo/client';

export const GET_USER_PROFILE = gql`
  query GetUserProfile {
    user_profiles {
      id
      full_name
      avatar_url
    }
  }
`;

export const GET_USER_PREFERENCES = gql`
  query GetUserPreferences {
    user_preferences {
      id
      topics
      keywords
      preferred_sources
    }
  }
`;

export const GET_ARTICLES = gql`
  query GetArticles($limit: Int!, $offset: Int!) {
    articles(
      order_by: { published_at: desc }
      limit: $limit
      offset: $offset
    ) {
      id
      title
      summary
      content
      source
      url
      image_url
      author
      published_at
      sentiment_label
      sentiment_explanation
    }
  }
`;

export const GET_BOOKMARKED_ARTICLES = gql`
  query GetBookmarkedArticles {
    bookmarks(order_by: { created_at: desc }) {
      id
      article {
        id
        title
        summary
        source
        url
        image_url
        published_at
        sentiment_label
      }
    }
  }
`; 