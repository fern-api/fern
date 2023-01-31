import yaml from "js-yaml";
import { Volume } from "memfs/lib/volume";
import { getPathToProjectFile } from "./utils";

export async function generatePrettierRc(volume: Volume): Promise<void> {
    await volume.promises.writeFile(
        getPathToProjectFile(".prettierrc.yml"),
        yaml.dump({
            tabWidth: 4,
            printWidth: 120,
        })
    );
}
