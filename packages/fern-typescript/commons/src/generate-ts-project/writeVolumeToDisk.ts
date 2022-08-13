import { mkdir, writeFile } from "fs/promises";
import Dirent from "memfs/lib/Dirent";
import { Volume } from "memfs/lib/volume";
import path from "path";

export async function writeVolumeToDisk(volume: Volume, directoyOnDiskToWriteTo: string): Promise<void> {
    await writeVolumeToDiskRecursive({
        volume,
        directoyOnDiskToWriteTo,
        directoryInVolume: "/",
    });
}

async function writeVolumeToDiskRecursive({
    volume,
    directoyOnDiskToWriteTo,
    directoryInVolume,
}: {
    volume: Volume;
    directoyOnDiskToWriteTo: string;
    directoryInVolume: string;
}): Promise<void> {
    const contents = (await volume.promises.readdir(directoryInVolume, { withFileTypes: true })) as Dirent[];
    for (const file of contents) {
        const fullPathInVolume = path.join(directoryInVolume, file.name.toString());
        const fullPathOnDisk = path.join(directoyOnDiskToWriteTo, fullPathInVolume);
        if (file.isDirectory()) {
            await mkdir(fullPathOnDisk, { recursive: true });
            await writeVolumeToDiskRecursive({ volume, directoyOnDiskToWriteTo, directoryInVolume: fullPathInVolume });
        } else {
            const contents = await volume.promises.readFile(fullPathInVolume);
            await mkdir(path.dirname(fullPathOnDisk), { recursive: true });
            await writeFile(fullPathOnDisk, contents);
        }
    }
}
