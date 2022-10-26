import { Volume } from "memfs/lib/volume";
import { OUTPUT_DIRECTORY } from "./constants";
import { RootService } from "./RootService";
import { getPathToProjectFile } from "./utils";

const LEADING_PERIOD_REGEX = /^\./;

export async function generateRootDeclarationFile({
    volume,
    rootService,
}: {
    volume: Volume;
    rootService: RootService;
}): Promise<void> {
    const pathToRootService = OUTPUT_DIRECTORY + rootService.moduleSpecifier.replace(LEADING_PERIOD_REGEX, "");

    await volume.promises.writeFile(
        getPathToProjectFile("index.d.ts"),
        [
            `export * from "./${OUTPUT_DIRECTORY}";`,
            `export { ${rootService.name} as default } from "./${pathToRootService}";`,
        ].join("\n")
    );
}
