import { execa } from "execa";
import { writeFile } from "fs/promises";
import path from "path";
import tmp from "tmp-promise";

import type { FernGeneratorCli } from "../configuration/sdk";
import * as serializers from "../configuration/sdk/serialization";

export function testGenerateReference({
    fixtureName,
    config
}: {
    fixtureName: string;
    config: FernGeneratorCli.ReferenceConfig;
}): void {
    describe(fixtureName, () => {
        it("generate reference", async () => {
            const file = await tmp.file();
            const json = JSON.stringify(await serializers.ReferenceConfig.jsonOrThrow(config), undefined, 2);
            await writeFile(file.path, json);

            const args = [path.join(__dirname, "../../bin/cli"), "generate-reference", "--config", file.path];
            const { stdout } = await execa("node", args);
            expect(stdout).toMatchFileSnapshot(`__snapshots__/${fixtureName}.md`);
        });
    });
}
