import { runEteTest } from "@fern-typescript/testing-utils";
import path from "path";
import { generateClientFiles } from "../generateClientFiles";

const MOCK_APIS_DIR = path.join(__dirname, "mocks");

describe("generateClientFiles", () => {
    it("posts", () => {
        return runEteTest({
            directory: path.join(MOCK_APIS_DIR, "posts"),
            generateFiles: ({ directory, intermediateRepresentation }) => {
                generateClientFiles({
                    directory,
                    intermediateRepresentation,
                });
            },
        });
    }, 60_000);
});
