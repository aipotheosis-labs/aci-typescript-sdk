import { ACI } from '@aci-sdk/aci';
import { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import dotenv from 'dotenv';
dotenv.config();

/**
 * This example demonstrates how to use the ACI SDK to interact with a weather app.
 * It shows the complete lifecycle of:
 * 1. Searching and getting app details
 * 2. Creating and managing app configurations
 * 3. Linking and managing user accounts
 * 4. Working with functions (search, definition, execution)
 */
async function searchApps() {
  // Initialize the ACI client
  const aci = new ACI({
    apiKey: process.env.ACI_API_KEY || 'your-api-key',
  });

  // Add request interceptor to log requests
  aci['client'].interceptors.request.use((request: AxiosRequestConfig) => {
    console.log('Request:', {
      method: request.method,
      url: request.url,
      baseURL: request.baseURL,
      headers: request.headers,
      params: request.params,
      data: request.data,
    });
    return request;
  });

  // Add response interceptor to log responses
  aci['client'].interceptors.response.use(
    (response: AxiosResponse) => {
      console.log('Response:', {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data,
      });
      return response;
    },
    (error: AxiosError) => {
      console.log('Error Response:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        headers: error.response?.headers,
        data: error.response?.data,
      });
      return Promise.reject(error);
    }
  );

  try {
    // Example 1: Search for apps
    console.log('Searching for apps...');
    const apps = await aci.apps.search({
      intent: 'weather forecast',
      allowed_apps_only: true,
      include_functions: true,
      limit: 5,
    });
    console.log('Found apps:', apps);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the example
searchApps().catch(console.error);
