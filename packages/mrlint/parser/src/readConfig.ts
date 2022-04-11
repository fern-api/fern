import { readFile } from "fs/promises";
import yaml from "js-yaml";
import path from "path";

export async function readConfig<T>(filepath: string, validate: (contents: unknown) => T): Promise<T> {
    const parsed = await parse(filepath);
    return validate(parsed);
}

async function parse(filepath: string): Promise<unknown> {
    const contents = (await readFile(filepath)).toString();
    const extension = path.extname(filepath);
    switch (extension) {
        case ".json":
            return JSON.parse(contents);
        case ".yml":
            return yaml.load(contents);
        default:
            throw new Error(`Invalid config file extension: ${extension}`);
    }
}
