import { setupDemo } from "./setupDemo";

void main();

const GITHUB_ORG_ID = "fern-FILL_ME_OUT";
const ORG_DISPLAY_NAME = "FILL_ME_OUT";
const ORG_ID = "FILL_ME_OUT";

async function main() {
    await setupDemo({
        githubAccessToken: getEnvVariable("GITHUB_TOKEN"),
        githubOrgId: GITHUB_ORG_ID,
        npmToken: getEnvVariable("FERN_NPM_TOKEN"),
        orgDisplayName: ORG_DISPLAY_NAME,
        orgId: ORG_ID,
        postmanApiKey: getEnvVariable("FERN_POSTMAN_API_KEY"),
    });
}

function getEnvVariable(envVar: string): string {
    const value = process.env[envVar];
    if (value == null) {
        throw new Error(`Failed to load ${envVar}`);
    }
    return value;
}
