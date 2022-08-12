import { itFernETE } from "@fern-typescript/testing-utils";
import path from "path";
import { generateClientProject } from "../generateClientProject";

const FIXTURES_DIR = path.join(__dirname, "fixtures");
const FIXTURES = ["posts", "no-errors", "chat", "auth"];

describe("generateClientProject", () => {
    for (const fixture of FIXTURES) {
        itFernETE(fixture, {
            testFile: __filename,
            pathToFixture: path.join(FIXTURES_DIR, fixture),
            generateFiles: async ({ volume, intermediateRepresentation }) => {
                await generateClientProject({
                    packageName: fixture,
                    packageVersion: "0.0.0",
                    volume,
                    intermediateRepresentation,
                });
            },
        });
    }
});
