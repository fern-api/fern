import { execa } from "execa";
import { writeFile } from "fs/promises";
import path from "path";
import tmp from "tmp-promise";

import type { FernGeneratorCli } from "../configuration/sdk/index.js";
import * as serializers from "../configuration/sdk/serialization/index.js";

const FIXTURES_PATH = path.join(__dirname, "fixtures");

// Spawn-based CLI tests cold-start a fresh `node` process and load the bundled CLI; on loaded
// CI runners the first spawn per file can exceed vitest's 5s default. Give them generous headroom.
export const README_SPAWN_TEST_TIMEOUT_MS = 60_000;

export function testGenerateReadme({
    fixtureName,
    config,
    originalReadme,
    skip
}: {
    fixtureName: string;
    config: FernGeneratorCli.ReadmeConfig;
    originalReadme?: string;
    skip?: boolean;
}): void {
    describe(fixtureName, () => {
        const itFunction = skip ? it.skip : it;
        itFunction(
            "generate readme",
            async () => {
                const file = await tmp.file();
                const json = JSON.stringify(await serializers.ReadmeConfig.jsonOrThrow(config), undefined, 2);
                await writeFile(file.path, json);

                const args = [path.join(__dirname, "../../bin/cli"), "generate", "readme", "--config", file.path];
                if (originalReadme != null) {
                    args.push(
                        ...[
                            "--original-readme",
                            getAbsolutePathToFixtureFile({
                                fixtureName,
                                filepath: originalReadme
                            })
                        ]
                    );
                }
                const { stdout } = await execa("node", args);
                await expect(stdout).toMatchFileSnapshot(`__snapshots__/${fixtureName}.md`);
            },
            // Each case cold-starts the CLI in a fresh `node` process; the default 5s timeout is
            // flaky under CI load when many spawn-based suites run in parallel.
            README_SPAWN_TEST_TIMEOUT_MS
        );
    });
}

function getAbsolutePathToFixtureFile({ fixtureName, filepath }: { fixtureName: string; filepath: string }): string {
    return path.join(FIXTURES_PATH, fixtureName, filepath);
}
