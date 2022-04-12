import { readFile, writeFile } from "fs/promises";
import prettier, { BuiltInParserName } from "prettier";

export async function formatFiles(filepaths: readonly string[]): Promise<void> {
    await Promise.all(filepaths.map(formatFile));
}

async function formatFile(filepath: string): Promise<void> {
    const fileContents = (await readFile(filepath)).toString();
    if (fileContents == null) {
        throw new Error("File does not exist");
    }
    const formatted = await format({ fileContents, filepath, prettierParser: undefined });
    await writeFile(filepath, formatted);
}

export async function format({
    fileContents,
    filepath,
    prettierParser,
}: {
    fileContents: string;
    filepath: string;
    prettierParser: BuiltInParserName | undefined;
}): Promise<string> {
    const prettierOptions = await prettier.resolveConfig(filepath, {
        useCache: false,
    });
    if (prettierOptions == null) {
        throw new Error("Could not locate prettier config.");
    }

    return prettier.format(fileContents, {
        ...prettierOptions,
        filepath,
        parser: prettierParser,
    });
}
