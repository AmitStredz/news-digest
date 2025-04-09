# Nhost Setup Guide for News Digest Application

This guide provides step-by-step instructions for setting up Nhost as the backend for the News Digest application.

## Prerequisites

1. Create a free [Nhost account](https://app.nhost.io/signup)
2. Basic knowledge of PostgreSQL and GraphQL

## Step 1: Create a New Nhost Project

1. Go to the [Nhost Dashboard](https://app.nhost.io/)
2. Click "New Project"
3. Name your project (e.g., "news-digest")
4. Select a region closest to your users
5. Click "Create Project"

## Step 2: Enable Required Auth Features

1. Go to "Auth" in the Nhost dashboard
2. Enable "Email & Password" sign-in method
3. Under "Allowed Redirect URLs", add your application URLs:
   - For development: `http://localhost:5173`
   - For production: Add your production URL
4. Under "Email Templates", customize the email verification template
5. In "General Settings", enable "Auto-activate users on sign-up" if you want to skip email verification (for development only)

## Step 3: Set Up the Database Schema

1. Navigate to "Database" in the Nhost dashboard
2. Click on "SQL Editor"
3. Copy and paste the SQL schema from `src/config/database-schema.sql` into the editor
4. Run the SQL to create the database tables and set up Row Level Security (RLS)

## Step 4: Create Hasura Permissions

1. Go to "Hasura" in the Nhost dashboard
2. For each table, set up appropriate permissions:
   - `user_profiles`: Select, Insert, Update permissions for users (filter by `user_id: X-Hasura-User-Id`)
   - `user_preferences`: Select, Insert, Update permissions for users (filter by `user_id: X-Hasura-User-Id`)
   - `bookmarks`: Select, Insert, Delete permissions for users (filter by `user_id: X-Hasura-User-Id`)
   - `reading_history`: Select, Insert permissions for users (filter by `user_id: X-Hasura-User-Id`)
   - `articles`: Select permissions for anyone
   - `article_topics`: Select permissions for anyone

## Step 5: Configure the Application

1. In the Nhost dashboard, go to the "Overview" page
2. Copy your Subdomain and Region values
3. Update `src/config/nhost.js` with these values:

```javascript
import { NhostClient } from '@nhost/nhost-js';

const nhost = new NhostClient({
  subdomain: 'YOUR_SUBDOMAIN', // e.g., abcdefgh
  region: 'YOUR_REGION', // e.g., eu-central-1
});

export default nhost;
```

## Step 6: Set Up N8N for News Fetching

### Create N8N Account and Workflow

1. Sign up for a [n8n account](https://app.n8n.cloud/signup)
2. Create a new workflow
3. Add a "Schedule Trigger" node to run at your desired frequency (e.g., every 12 hours)

### News API Node

1. Add an "HTTP Request" node
2. Configure it to fetch from a free news API (e.g., [NewsAPI.org](https://newsapi.org/))
3. Set up proper query parameters based on user preferences

### OpenRouter Integration for AI Processing

1. Add another "HTTP Request" node
2. Configure it to call OpenRouter API:
   - URL: `https://openrouter.ai/api/v1/chat/completions`
   - Method: POST
   - Headers: 
     - `Content-Type: application/json` 
     - `Authorization: Bearer YOUR_OPENROUTER_API_KEY`
   - Body:
     ```json
     {
       "model": "openai/gpt-3.5-turbo",
       "messages": [
         {
           "role": "system",
           "content": "You will generate a concise summary and sentiment analysis for news articles."
         },
         {
           "role": "user",
           "content": "Summarize this article in 3 sentences and determine the sentiment (positive, neutral, negative) with a brief explanation. Article: {{$node[\"NewsAPI\"].json[\"articles\"][0][\"content\"]}}"
         }
       ]
     }
     ```

### Nhost Database Update Node

1. Add a "GraphQL" node
2. Configure it to connect to your Hasura GraphQL endpoint
3. Add necessary headers for authentication
4. Set up a mutation to insert the processed article with summary and sentiment

### Workflow Testing and Activation

1. Test your workflow with sample data
2. Once it's working correctly, activate the workflow
3. Monitor the execution logs to ensure it's running as expected

## Step 7: Additional Security Considerations

### JWT Token Handling

- Always include the JWT token from Nhost in your GraphQL requests:

```javascript
const executeQuery = async (query, variables) => {
  const token = nhost.auth.getAccessToken();
  
  const response = await fetch('https://hasura.your-nhost-app.nhost.run/v1/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      query,
      variables
    })
  });
  
  return await response.json();
};
```

### Email Verification

- Ensure your application properly handles the email verification flow
- Display appropriate messaging when users need to verify their emails
- Implement a resend verification email functionality

## Step 8: Production Deployment

1. Update the Nhost configuration with your production subdomain and region
2. Update allowed redirect URLs in the Nhost Auth settings
3. Set up proper CORS policies in Nhost

## Troubleshooting

### Common Issues

1. **Authentication Errors**: Ensure your JWT token is correctly included in requests
2. **Permission Errors**: Verify Hasura permissions are set up correctly
3. **Database Errors**: Check for schema issues or constraint violations
4. **CORS Issues**: Make sure your domain is properly allowed in Nhost settings

### Getting Help

- [Nhost Documentation](https://docs.nhost.io/)
- [Hasura Documentation](https://hasura.io/docs/)
- [n8n Documentation](https://docs.n8n.io/)
- [OpenRouter Documentation](https://openrouter.ai/docs)

## Next Steps

After setting up your Nhost backend, consider these enhancements:

1. Implement caching strategies for GraphQL queries
2. Set up monitoring and alerts for your Nhost project
3. Create a development/staging environment separate from production
4. Implement a CI/CD pipeline for database migrations 