import { execa } from "execa";
import { writeFile } from "fs/promises";
import path from "path";
import tmp from "tmp-promise";

describe("GitHub PR CLI call", () => {
    const GITHUB_TOKEN = "";

    if (!GITHUB_TOKEN) {
        console.warn("Skipping GitHub PR test: GITHUB_TOKEN not set in environment.");
        return;
    }

    it.skip("should create a PR using the CLI with a valid config", async () => {
        // Prepare a minimal GitHub config for the CLI
        const config = {
            uri: "fern-api/fai-sdk", // Replace with a test repo you have access to
            token: GITHUB_TOKEN,
            sourceDirectory: path.join(__dirname, "github/sample-repo"), // Use the sample repo directory
            branch: undefined
        };

        // Write config to a temp file
        const file = await tmp.file();
        await writeFile(file.path, JSON.stringify(config, undefined, 2));

        const args = [path.join(__dirname, "../../dist/cli.cjs"), "github", "pr", "--config", file.path];

        const { stdout } = await execa("node", args);
        expect(stdout).toMatchSnapshot();
    });
});
