import { execa } from "execa";
import { writeFile } from "fs/promises";
import path from "path";
import tmp from "tmp-promise";

import type { FernGeneratorCli } from "../configuration/sdk/index.js";
import * as serializers from "../configuration/sdk/serialization/index.js";
import { README_SPAWN_TEST_TIMEOUT_MS } from "./testGenerateReadme.js";

export function testGenerateSkill({
    fixtureName,
    config
}: {
    fixtureName: string;
    config: FernGeneratorCli.ReadmeConfig;
}): void {
    describe(fixtureName, () => {
        it(
            "generate skill",
            async () => {
                const file = await tmp.file();
                const json = JSON.stringify(await serializers.ReadmeConfig.jsonOrThrow(config), undefined, 2);
                await writeFile(file.path, json);

                const { stdout } = await execa("node", [
                    path.join(__dirname, "../../bin/cli"),
                    "generate-skill",
                    "--config",
                    file.path
                ]);
                await expect(stdout).toMatchFileSnapshot(`__snapshots__/skill-${fixtureName}.md`);
            },
            README_SPAWN_TEST_TIMEOUT_MS
        );
    });
}
