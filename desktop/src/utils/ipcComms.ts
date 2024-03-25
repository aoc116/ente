import chokidar from "chokidar";
import {
    app,
    BrowserWindow,
    dialog,
    ipcMain,
    safeStorage,
    shell,
    Tray,
} from "electron";
import path from "path";
import { attachIPCHandlers } from "../main/ipc";
import {
    muteUpdateNotification,
    skipAppUpdate,
    updateAndRestart,
} from "../services/appUpdater";
import {
    computeImageEmbedding,
    computeTextEmbedding,
} from "../services/clipService";
import { deleteTempFile, runFFmpegCmd } from "../services/ffmpeg";
import { getDirFilePaths } from "../services/fs";
import {
    convertToJPEG,
    generateImageThumbnail,
} from "../services/imageProcessor";
import { generateTempFilePath } from "./temp";

export default function setupIpcComs(
    tray: Tray,
    mainWindow: BrowserWindow,
    watcher: chokidar.FSWatcher,
): void {
    attachIPCHandlers();

    ipcMain.handle("select-dir", async () => {
        const result = await dialog.showOpenDialog({
            properties: ["openDirectory"],
        });
        if (result.filePaths && result.filePaths.length > 0) {
            return result.filePaths[0]?.split(path.sep)?.join(path.posix.sep);
        }
    });

    ipcMain.handle("show-upload-files-dialog", async () => {
        const files = await dialog.showOpenDialog({
            properties: ["openFile", "multiSelections"],
        });
        return files.filePaths;
    });

    ipcMain.handle("show-upload-zip-dialog", async () => {
        const files = await dialog.showOpenDialog({
            properties: ["openFile", "multiSelections"],
            filters: [{ name: "Zip File", extensions: ["zip"] }],
        });
        return files.filePaths;
    });

    ipcMain.handle("show-upload-dirs-dialog", async () => {
        const dir = await dialog.showOpenDialog({
            properties: ["openDirectory", "multiSelections"],
        });

        let files: string[] = [];
        for (const dirPath of dir.filePaths) {
            files = [...files, ...(await getDirFilePaths(dirPath))];
        }

        return files;
    });

    ipcMain.handle("add-watcher", async (_, args: { dir: string }) => {
        watcher.add(args.dir);
    });

    ipcMain.handle("remove-watcher", async (_, args: { dir: string }) => {
        watcher.unwatch(args.dir);
    });

    ipcMain.handle("safeStorage-encrypt", (_, message) => {
        return safeStorage.encryptString(message);
    });

    ipcMain.handle("safeStorage-decrypt", (_, message) => {
        return safeStorage.decryptString(message);
    });

    ipcMain.handle("convert-to-jpeg", (_, fileData, filename) => {
        return convertToJPEG(fileData, filename);
    });

    ipcMain.handle(
        "run-ffmpeg-cmd",
        (_, cmd, inputFilePath, outputFileName, dontTimeout) => {
            return runFFmpegCmd(
                cmd,
                inputFilePath,
                outputFileName,
                dontTimeout,
            );
        },
    );
    ipcMain.handle("get-temp-file-path", (_, formatSuffix) => {
        return generateTempFilePath(formatSuffix);
    });
    ipcMain.handle("remove-temp-file", (_, tempFilePath: string) => {
        return deleteTempFile(tempFilePath);
    });

    ipcMain.handle(
        "generate-image-thumbnail",
        (_, fileData, maxDimension, maxSize) => {
            return generateImageThumbnail(fileData, maxDimension, maxSize);
        },
    );

    ipcMain.handle("compute-image-embedding", (_, model, inputFilePath) => {
        return computeImageEmbedding(model, inputFilePath);
    });
    ipcMain.handle("compute-text-embedding", (_, model, text) => {
        return computeTextEmbedding(model, text);
    });
}
