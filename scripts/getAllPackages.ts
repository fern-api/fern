import execa from "execa";

export interface YarnPackage {
    name: string;
    location: string;
}

const MONOREPO_ROOT_PACKAGE = "fern";

export async function getAllPackages({ since = false }: { since?: boolean } = {}): Promise<YarnPackage[]> {
    const args = ["workspaces", "list", "--json"];
    if (since) {
        args.push("--since");
    }

    const { stdout } = await execa("yarn", args);
    return stdout
        .trim()
        .split("\n")
        .map((line): YarnPackage => JSON.parse(line))
        .filter((p) => p.name !== MONOREPO_ROOT_PACKAGE);
}
