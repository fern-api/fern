import { doesPathExist } from "@fern-api/fs-utils";
import { readFile } from "fs/promises";
import { getPathToTokenFile } from "./getPathToTokenFile";

const FERN_TOKEN_ENV_VAR = "FERN_TOKEN";

export async function getToken(): Promise<string | undefined> {
    if (process.env[FERN_TOKEN_ENV_VAR] != null) {
        return process.env[FERN_TOKEN_ENV_VAR];
    }

    const pathToTokenFile = getPathToTokenFile();

    const doesTokenFileExist = await doesPathExist(pathToTokenFile);
    if (!doesTokenFileExist) {
        return undefined;
    }

    const tokenFileContents = await readFile(pathToTokenFile);
    const token = tokenFileContents.toString().trim();
    if (token.length === 0) {
        return undefined;
    }
    return token;
}
