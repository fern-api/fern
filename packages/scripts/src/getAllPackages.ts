import execa from "execa";
import path from "path";

export interface YarnPackage {
    name: string;
    location: string;
}

export async function getAllPackages({ since = false }: { since?: boolean } = {}): Promise<YarnPackage[]> {
    const args = ["workspaces", "list", "--json"];
    if (since) {
        args.push("--since", "--recursive");
    }

    const { stdout } = await execa("yarn", args);
    const trimmedStdout = stdout.trim();

    if (trimmedStdout === "") {
        return [];
    }

    return trimmedStdout.split("\n").reduce<YarnPackage[]>((packages, line) => {
        const parsed = JSON.parse(line) as YarnPackage;
        if (parsed.location !== ".") {
            packages.push({
                name: parsed.name,
                location: path.resolve(__dirname, "../../..", parsed.location)
            });
        }
        return packages;
    }, []);
}
