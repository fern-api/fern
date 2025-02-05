import latestVersion from "latest-version";

import { CliEnvironment } from "../CliEnvironment";

export async function doesVersionOfCliExist({
    cliEnvironment,
    version
}: {
    cliEnvironment: CliEnvironment;
    version: string;
}): Promise<boolean> {
    try {
        await latestVersion(cliEnvironment.packageName, {
            version
        });
        return true;
    } catch (e) {
        return false;
    }
}
