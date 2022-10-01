import { Volume } from "memfs/lib/volume";
import { getPathToProjectFile } from "./utils";

export async function generatePrettierIgnore(volume: Volume): Promise<void> {
    await volume.promises.writeFile(
        getPathToProjectFile(".prettierignore"),
        [".yarn", "node_modules", ".npmignore", ".pnp.cjs", "*.js", "*.d.ts"].join("\n")
    );
}
