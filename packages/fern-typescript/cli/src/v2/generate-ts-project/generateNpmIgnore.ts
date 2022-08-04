import { Volume } from "memfs/lib/volume";
import { getPathToProjectFile } from "./utils";

export async function generateNpmIgnore(volume: Volume): Promise<void> {
    await volume.promises.writeFile(
        getPathToProjectFile(".npmignore"),
        [
            "tsconfig.json",
            ".pnp.*",
            ".yarn/*",
            "!.yarn/patches",
            "!.yarn/plugins",
            "!.yarn/releases",
            "!.yarn/sdks",
            "!.yarn/versions",
            "*.ts",
            "!*.d.ts",
        ].join("\n")
    );
}
