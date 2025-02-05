import { readFile } from "fs/promises";
import yaml from "js-yaml";

import { DefinitionFile, serialization } from "@fern-api/conjure-sdk";
import { AbsoluteFilePath, RelativeFilePath, listFiles, relative } from "@fern-api/fs-utils";

export interface ConjureFile {
    fileContents: DefinitionFile;
    absoluteFilepath: AbsoluteFilePath;
    relativeFilepath: RelativeFilePath;
}

export async function listConjureFiles(root: AbsoluteFilePath, extensionGlob: string): Promise<ConjureFile[]> {
    const files: ConjureFile[] = [];

    for (const absoluteFilepath of await listFiles(root, extensionGlob)) {
        files.push(
            await createConjureFile({
                relativeFilepath: relative(root, absoluteFilepath),
                absoluteFilepath
            })
        );
    }

    return files;
}

async function createConjureFile({
    relativeFilepath,
    absoluteFilepath
}: {
    relativeFilepath: RelativeFilePath;
    absoluteFilepath: AbsoluteFilePath;
}): Promise<ConjureFile> {
    const rawContents = (await readFile(absoluteFilepath))
        .toString()
        .replaceAll(": rid", ": string")
        .replaceAll("<rid>", "<string>")
        .replaceAll("rid>", "string>")
        .replaceAll(": safelong", ": long")
        .replaceAll("<safelong>", "<long>")
        .replaceAll("safelong>", "long>")
        .replaceAll(": any", ": unknown")
        .replaceAll("<any>", "<unknown>")
        .replaceAll("any>", "unknown>");
    return {
        relativeFilepath,
        absoluteFilepath,
        fileContents: serialization.DefinitionFile.parseOrThrow(yaml.load(rawContents), {
            unrecognizedObjectKeys: "passthrough",
            allowUnrecognizedEnumValues: true,
            allowUnrecognizedUnionMembers: true
        })
    };
}
