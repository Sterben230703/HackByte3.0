// Using Google API Client Library for browser
let gapi: any;

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
}

export const initializeDrive = async (apiKey: string) => {
  // Load the Google API Client Library
  if (typeof window !== 'undefined' && !window.gapi) {
    await new Promise<void>((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => resolve();
      document.body.appendChild(script);
    });
  }

  // Initialize the gapi client
  await new Promise<void>((resolve) => {
    window.gapi.load('client', async () => {
      await window.gapi.client.init({
        apiKey: apiKey,
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
      });
      gapi = window.gapi;
      resolve();
    });
  });
};

export const listDriveFiles = async (): Promise<DriveFile[]> => {
  if (!gapi) throw new Error('Drive API not initialized');

  try {
    const response = await gapi.client.drive.files.list({
      pageSize: 100,
      fields: 'files(id, name, mimeType, webViewLink)',
    });

    return response.result.files;
  } catch (error) {
    console.error('Error listing drive files:', error);
    throw error;
  }
};

export const getDriveFileContent = async (fileId: string): Promise<string> => {
  if (!gapi) throw new Error('Drive API not initialized');

  try {
    const response = await gapi.client.drive.files.get({
      fileId,
      alt: 'media',
    });

    return response.body;
  } catch (error) {
    console.error('Error getting drive file content:', error);
    throw error;
  }
};

// Add type definition for window.gapi
declare global {
  interface Window {
    gapi: any;
  }
}
