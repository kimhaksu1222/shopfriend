import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "686312981a63f89d473d136a", 
  requiresAuth: true // Ensure authentication is required for all operations
});
