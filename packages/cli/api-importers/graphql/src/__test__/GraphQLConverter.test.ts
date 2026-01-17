import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { readdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { describe, expect, it } from "vitest";
import { GraphQLConverter } from "../GraphQLConverter";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FIXTURES_DIR = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("fixtures"));
const filterFixture = process.env.TEST_FIXTURE;

describe("GraphQLConverter", async () => {
    for (const fixture of await readdir(FIXTURES_DIR, { withFileTypes: true })) {
        if (!fixture.isDirectory() || (filterFixture && fixture.name !== filterFixture)) {
            continue;
        }

        it(fixture.name, async () => {
            const fixturePath = join(FIXTURES_DIR, RelativeFilePath.of(fixture.name), RelativeFilePath.of("schema.graphql"));
            const context = createMockTaskContext();
            
            const converter = new GraphQLConverter({
                context,
                filePath: fixturePath
            });

            const result = await converter.convert();
            
            await expect(JSON.stringify(result, undefined, 2)).toMatchFileSnapshot(
                `./__snapshots__/${fixture.name}.json`
            );
        }, 30_000);
    }
});
