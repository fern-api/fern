import type { AbsoluteFilePath } from "@fern-api/fs-utils";
import { RelativeFilePath, relative } from "@fern-api/path-utils";
import { readFile } from "fs/promises";
import { parse, parseDocument } from "yaml";
import { YamlDocument } from "./YamlDocument";

export class YamlParser {
    /**
     * Loads and parses a YAML file.
     *
     * @param filepath - The absolute path to the YAML file.
     * @returns The parsed YAML content as a plain JavaScript value.
     * @throws Error if the file cannot be read or contains invalid YAML.
     */
    public async parse(absoluteFilePath: AbsoluteFilePath): Promise<unknown> {
        const source = await readFile(absoluteFilePath, "utf-8");
        return parse(source);
    }

    /**
     * Loads and parses a YAML file, preserving source location information.
     *
     * Use this method when you need to report errors with line/column numbers.
     *
     * @param absoluteFilePath - The absolute path to the YAML file.
     * @param cwd - The current working directory, used to compute relative paths for error messages.
     * @returns A YamlDocument that provides source location lookups.
     * @throws Error if the file cannot be read or contains invalid YAML.
     */
    public async parseDocument({
        absoluteFilePath,
        cwd
    }: {
        absoluteFilePath: AbsoluteFilePath;
        cwd: AbsoluteFilePath;
    }): Promise<YamlDocument> {
        const source = await readFile(absoluteFilePath, "utf-8");
        const document = parseDocument(source);
        const relativeFilePath = RelativeFilePath.of(relative(cwd, absoluteFilePath));
        return new YamlDocument({
            absoluteFilePath,
            relativeFilePath,
            document,
            source
        });
    }
}
