import { readFile } from "fs/promises";

import { doesPathExist } from "@fern-api/fs-utils";

import { FernOrganizationToken, FernToken, FernUserToken } from "../FernToken";
import { getPathToTokenFile } from "./getPathToTokenFile";

const FERN_TOKEN_ENV_VAR = "FERN_TOKEN";

export async function getToken(): Promise<FernToken | undefined> {
    return (await getAccessToken()) ?? (await getUserToken());
}

export async function getAccessToken(): Promise<FernOrganizationToken | undefined> {
    const tokenFromEnvVar = process.env[FERN_TOKEN_ENV_VAR];
    if (tokenFromEnvVar == null) {
        return undefined;
    }
    return {
        type: "organization",
        value: tokenFromEnvVar
    };
}

export async function getUserToken(): Promise<FernUserToken | undefined> {
    const pathToTokenFile = getPathToTokenFile();
    const doesTokenFileExist = await doesPathExist(pathToTokenFile);
    if (!doesTokenFileExist) {
        return undefined;
    }

    const tokenFileContents = await readFile(pathToTokenFile);
    const tokenString = tokenFileContents.toString().trim();
    if (tokenString.length === 0) {
        return undefined;
    }

    return {
        type: "user",
        value: tokenString
    };
}
