import contentfulManagement from 'contentful-management';

export const getClient = async () => {
  // Check if the script is running in a Node.js environment
  if (typeof process !== 'undefined' && process.env) {
    console.log(
      'Running in Node.js, use process.env to access environment variables'
    );
    console.log(
      'access token: ',
      process.env.VITE_CONTENTFUL_MANAGEMENT_API_KEY
    );
    return contentfulManagement.createClient({
      accessToken: process.env.VITE_CONTENTFUL_MANAGEMENT_API_KEY as string,
    });
  } else {
    console.log(
      'Running in Vite, use import.meta.env to access environment variables'
    );
    // Running in Vite, use import.meta.env to access environment variables
    const { createClient } = await import('contentful-management');
    return createClient({
      accessToken: import.meta.env.VITE_CONTENTFUL_MANAGEMENT_API_KEY,
    });
  }
};
