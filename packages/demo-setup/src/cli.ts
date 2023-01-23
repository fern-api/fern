import { setupDemo } from "./setupDemo";

void main();

async function main() {
    await setupDemo({
        githubAccessToken: getEnvVariable("GITHUB_TOKEN"),
        githubOrgId: "fern-flagright",
        npmToken: getEnvVariable("FERN_NPM_TOKEN"),
        orgDisplayName: "Flagright",
        orgId: "flagright",
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
