import { gql } from '@apollo/client';

export const UPDATE_USER_PREFERENCES = gql`
  mutation UpdateUserPreferences(
    $userId: uuid!,
    $topics: jsonb!,
    $keywords: jsonb!,
    $preferred_sources: jsonb!
  ) {
    insert_user_preferences(
      objects: {
        user_id: $userId,
        topics: $topics,
        keywords: $keywords,
        preferred_sources: $preferred_sources
      },
      on_conflict: {
        constraint: user_preferences_user_id_key,
        update_columns: [topics, keywords, preferred_sources]
      }
    ) {
      returning {
        id
        topics
        keywords
        preferred_sources
      }
    }
  }
`;
export const ADD_BOOKMARK = gql`
  mutation AddBookmark($articleId: uuid!, $userId: uuid!) {
    insert_bookmarks(
      objects: {
        article_id: $articleId
        user_id: $userId
      }
    ) {
      returning {
        id
        created_at
        article {
          id
          title
          summary
          url
          source
          published_at
          sentiment_label
          image_url
        }
      }
    }
  }
`;


export const REMOVE_BOOKMARK = gql`
  mutation RemoveBookmark($bookmarkId: uuid!) {
    delete_bookmarks(
      where: { id: { _eq: $bookmarkId } }
    ) {
      returning {
        id
      }
    }
  }
`;

export const UPDATE_USER_PROFILE = gql`
  mutation UpdateUserProfile(
    $userId: uuid!,
    $fullName: String,
    $avatarUrl: String
  ) {
    insert_user_profiles(
      objects: {
        user_id: $userId,
        full_name: $fullName,
        avatar_url: $avatarUrl
      },
      on_conflict: {
        constraint: user_profiles_user_id_key,
        update_columns: [full_name, avatar_url]
      }
    ) {
      returning {
        id
        full_name
        avatar_url
      }
    }
  }
`; 