import { expect } from '@playwright/test';
import { UserData } from './user_data.js';

export async function checkApi(request, failure = false) {
  let response = await request.get('/api/v1/users/me', { 
    headers: {
      'Authorization': `Bearer ${UserData.apiKey}`
    }
  });
  failure ? expect(response.ok()).toBeFalsy() : expect(response.ok()).toBeTruthy()
};