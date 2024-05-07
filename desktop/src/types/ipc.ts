/**
 * @file types that are shared across the IPC boundary with the renderer process
 *
 * This file is manually kept in sync with the renderer code.
 * See [Note: types.ts <-> preload.ts <-> ipc.ts]
 */

export interface AppUpdate {
    autoUpdatable: boolean;
    version: string;
}

export interface FolderWatch {
    collectionMapping: CollectionMapping;
    folderPath: string;
    syncedFiles: FolderWatchSyncedFile[];
    ignoredFiles: string[];
}

export type CollectionMapping = "root" | "parent";

export interface FolderWatchSyncedFile {
    path: string;
    uploadedFileID: number;
    collectionID: number;
}

export type ZipItem = [zipPath: string, entryName: string];

export interface PendingUploads {
    collectionName: string | undefined;
    filePaths: string[];
    zipItems: ZipItem[];
}

/**
 * See: [Note: Custom errors across Electron/Renderer boundary]
 *
 * Note: this is not a type, and cannot be used in preload.js; it is only meant
 * for use in the main process code.
 */
export const CustomErrorMessage = {
    NotAvailable: "This feature in not available on the current OS/arch",
};
