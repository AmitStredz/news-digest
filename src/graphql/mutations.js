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
  mutation AddBookmark(
    $userId: uuid!,
    $title: String!,
    $url: String!,
    $source: String!,
    $published_at: timestamptz!,
    $image_url: String,
    $summary: String,
    $sentiment_label: String
  ) {
    insert_bookmarks_one(object: {
      user_id: $userId,
      title: $title,
      url: $url,
      source: $source,
      published_at: $published_at,
      image_url: $image_url,
      summary: $summary,
      sentiment_label: $sentiment_label
    }) {
      id
      title
      url
      source
      published_at
      image_url
      summary
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