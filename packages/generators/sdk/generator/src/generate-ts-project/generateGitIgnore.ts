import { Volume } from "memfs/lib/volume";
import { getPathToProjectFile } from "./utils";

export async function generateGitIgnore(volume: Volume): Promise<void> {
    await volume.promises.writeFile(
        getPathToProjectFile(".gitignore"),
        [
            "node_modules",
            ".DS_Store",
            "*.d.ts",
            "dist/",
            "",
            "# yarn berry",
            ".pnp.*",
            ".yarn/*",
            "!.yarn/patches",
            "!.yarn/plugins",
            "!.yarn/releases",
            "!.yarn/sdks",
            "!.yarn/versions",
        ].join("\n")
    );
}
