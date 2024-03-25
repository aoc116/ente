import { ElectronFile } from "@ente/shared/upload/types";
import { WatchMapping } from "@ente/shared/watchFolder/types";

export interface AppUpdateInfo {
    autoUpdatable: boolean;
    version: string;
}

export enum Model {
    GGML_CLIP = "ggml-clip",
    ONNX_CLIP = "onnx-clip",
}

/**
 * Extra APIs provided by the Node.js layer when our code is running in Electron
 *
 * This list is manually kept in sync with `desktop/src/preload.ts`. In case of
 * a mismatch, the types may lie.
 *
 * These extra objects and functions will only be available when our code is
 * running as the renderer process in Electron. So something in the code path
 * should check for `isElectron() == true` before invoking these.
 */
export interface ElectronAPIsType {
    // - General

    /** Return the version of the desktop app. */
    appVersion: () => Promise<string>;

    /**
     * Open the given {@link dirPath} in the system's folder viewer.
     *
     * For example, on macOS this'll open {@link dirPath} in Finder.
     */
    openDirectory: (dirPath: string) => Promise<void>;

    /**
     * Open the app's log directory in the system's folder viewer.
     *
     * @see {@link openDirectory}
     */
    openLogDirectory: () => Promise<void>;

    /**
     * Log the given {@link message} to the on-disk log file maintained by the
     * desktop app.
     *
     * Note: Unlike the other functions exposed over the Electron bridge,
     * logToDisk is fire-and-forge and does not return a promise.
     */
    logToDisk: (message: string) => void;

    /**
     * A subset of filesystem access APIs.
     *
     * The renderer process, being a web process, does not have full access to
     * the local filesystem apart from files explicitly dragged and dropped (or
     * selected by the user in a native file open dialog).
     *
     * The main process, however, has full filesystem access (limited only be an
     * OS level sandbox on the entire process).
     *
     * When we're running in the desktop app, we want to better utilize the
     * local filesystem access to provide more integrated features to the user -
     * things that are not currently possible using web technologies. For
     * example, continuous exports to an arbitrary user chosen location on disk,
     * or watching some folders for changes and syncing them automatically.
     *
     * Towards this end, this fs object provides some generic file system access
     * functions that are needed for such features. In addition, there are other
     * feature specific methods too in the top level electron object.
     */
    fs: {
        /**
         * Return true if there is a file or directory at the given
         * {@link path}.
         */
        exists: (path: string) => Promise<boolean>;
    };

    /** TODO: AUDIT below this */
    // - General
    registerForegroundEventListener: (onForeground: () => void) => void;
    clearElectronStore: () => void;

    // - FS legacy
    checkExistsAndCreateDir: (dirPath: string) => Promise<void>;

    // - App update
    updateAndRestart: () => void;
    skipAppUpdate: (version: string) => void;
    muteUpdateNotification: (version: string) => void;

    registerUpdateEventListener: (
        showUpdateDialog: (updateInfo: AppUpdateInfo) => void,
    ) => void;

    /** TODO: FIXME or migrate below this */
    saveStreamToDisk: (
        path: string,
        fileStream: ReadableStream<any>,
    ) => Promise<void>;
    saveFileToDisk: (path: string, file: any) => Promise<void>;
    selectDirectory: () => Promise<string>;
    readTextFile: (path: string) => Promise<string>;
    showUploadFilesDialog: () => Promise<ElectronFile[]>;
    showUploadDirsDialog: () => Promise<ElectronFile[]>;
    getPendingUploads: () => Promise<{
        files: ElectronFile[];
        collectionName: string;
        type: string;
    }>;
    setToUploadFiles: (type: string, filePaths: string[]) => void;
    showUploadZipDialog: () => Promise<{
        zipPaths: string[];
        files: ElectronFile[];
    }>;
    getElectronFilesFromGoogleZip: (
        filePath: string,
    ) => Promise<ElectronFile[]>;
    setToUploadCollection: (collectionName: string) => void;
    getDirFiles: (dirPath: string) => Promise<ElectronFile[]>;
    getWatchMappings: () => WatchMapping[];
    updateWatchMappingSyncedFiles: (
        folderPath: string,
        files: WatchMapping["syncedFiles"],
    ) => void;
    updateWatchMappingIgnoredFiles: (
        folderPath: string,
        files: WatchMapping["ignoredFiles"],
    ) => void;
    addWatchMapping: (
        collectionName: string,
        folderPath: string,
        uploadStrategy: number,
    ) => Promise<void>;
    removeWatchMapping: (folderPath: string) => Promise<void>;
    registerWatcherFunctions: (
        addFile: (file: ElectronFile) => Promise<void>,
        removeFile: (path: string) => Promise<void>,
        removeFolder: (folderPath: string) => Promise<void>,
    ) => void;
    isFolder: (dirPath: string) => Promise<boolean>;
    setEncryptionKey: (encryptionKey: string) => Promise<void>;
    getEncryptionKey: () => Promise<string>;
    convertToJPEG: (
        fileData: Uint8Array,
        filename: string,
    ) => Promise<Uint8Array>;
    runFFmpegCmd: (
        cmd: string[],
        inputFile: File | ElectronFile,
        outputFileName: string,
        dontTimeout?: boolean,
    ) => Promise<File>;

    generateImageThumbnail: (
        inputFile: File | ElectronFile,
        maxDimension: number,
        maxSize: number,
    ) => Promise<Uint8Array>;
    moveFile: (oldPath: string, newPath: string) => Promise<void>;
    deleteFolder: (path: string) => Promise<void>;
    deleteFile: (path: string) => Promise<void>;
    rename: (oldPath: string, newPath: string) => Promise<void>;
    computeImageEmbedding: (
        model: Model,
        imageData: Uint8Array,
    ) => Promise<Float32Array>;
    computeTextEmbedding: (model: Model, text: string) => Promise<Float32Array>;
}
