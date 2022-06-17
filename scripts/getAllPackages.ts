import { exec } from "./promifisiedExec";

export interface YarnPackage {
    name: string;
    location: string;
}

const MONOREPO_ROOT_PACKAGE = "fern";

export async function getAllPackages(): Promise<YarnPackage[]> {
    const { stdout } = await exec("yarn workspaces list --json");
    return stdout
        .trim()
        .split("\n")
        .map((line): YarnPackage => JSON.parse(line))
        .filter((p) => p.name !== MONOREPO_ROOT_PACKAGE);
}
