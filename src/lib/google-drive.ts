import { google } from 'googleapis';
import { Readable } from 'stream';

// Google Drive credentials from environment
const GOOGLE_DRIVE_CREDENTIALS = process.env.GOOGLE_DRIVE_CREDENTIALS;
const GOOGLE_DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;

/**
 * Initialize Google Drive API client
 */
function getDriveClient() {
  if (!GOOGLE_DRIVE_CREDENTIALS) {
    throw new Error('Missing GOOGLE_DRIVE_CREDENTIALS environment variable');
  }

  try {
    const credentials = JSON.parse(GOOGLE_DRIVE_CREDENTIALS);

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });

    return google.drive({ version: 'v3', auth });
  } catch (error) {
    throw new Error('Failed to initialize Google Drive client: Invalid credentials');
  }
}

/**
 * Upload a file to Google Drive
 *
 * @param fileBuffer - File buffer to upload
 * @param fileName - Name of the file
 * @param mimeType - MIME type of the file
 * @returns Object containing file ID and public URL
 */
export async function uploadFile(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<{ fileId: string; url: string }> {
  if (!GOOGLE_DRIVE_FOLDER_ID) {
    throw new Error('Missing GOOGLE_DRIVE_FOLDER_ID environment variable');
  }

  try {
    const drive = getDriveClient();

    // Convert buffer to readable stream
    const fileStream = Readable.from(fileBuffer);

    // Upload file to Google Drive
    const response = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [GOOGLE_DRIVE_FOLDER_ID],
      },
      media: {
        mimeType,
        body: fileStream,
      },
      fields: 'id, webViewLink, webContentLink',
    });

    if (!response.data.id) {
      throw new Error('Failed to upload file: No file ID returned');
    }

    // Make file publicly accessible (read-only)
    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    // Generate public URL
    const url = response.data.webViewLink || `https://drive.google.com/file/d/${response.data.id}/view`;

    return {
      fileId: response.data.id,
      url,
    };
  } catch (error) {
    throw new Error(
      `Failed to upload file to Google Drive: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Delete a file from Google Drive
 *
 * @param fileId - ID of the file to delete
 */
export async function deleteFile(fileId: string): Promise<void> {
  try {
    const drive = getDriveClient();

    await drive.files.delete({
      fileId,
    });
  } catch (error) {
    throw new Error(
      `Failed to delete file from Google Drive: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Get file metadata from Google Drive
 *
 * @param fileId - ID of the file
 * @returns File metadata
 */
export async function getFileMetadata(fileId: string) {
  try {
    const drive = getDriveClient();

    const response = await drive.files.get({
      fileId,
      fields: 'id, name, mimeType, size, createdTime, webViewLink',
    });

    return response.data;
  } catch (error) {
    throw new Error(
      `Failed to get file metadata: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
