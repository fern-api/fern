import latestVersion from "latest-version";

export async function doesVersionOfSeedExist({ version }: { version: string }): Promise<boolean> {
    try {
        await latestVersion("@fern-api/seed-cli", {
            version
        });
        return true;
    } catch (e) {
        return false;
    }
}
