import { Monorepo } from "@mrlint/commons";
import { getAllPackages } from "./getAllPackages";
import { getMonorepoRoot } from "./getMonorepoRoot";

export async function parseMonorepo(): Promise<Monorepo> {
    const root = await getMonorepoRoot();
    return {
        root,
        packages: await getAllPackages(root),
    };
}
