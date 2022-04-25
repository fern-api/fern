import { runEteTest } from "@fern-typescript/testing-utils";
import path from "path";
import { generateModelFiles } from "../generateModelFiles";

const MOCK_APIS_DIR = path.join(__dirname, "mocks");

describe("generateModelFiles", () => {
    it("posts", () => {
        return runEteTest({
            directory: path.join(MOCK_APIS_DIR, "posts"),
            generateFiles: ({ directory, intermediateRepresentation }) => {
                generateModelFiles({
                    directory,
                    intermediateRepresentation,
                });
            },
        });
    }, 60_000);

    it("fern IR", () => {
        return runEteTest({
            directory: path.join(MOCK_APIS_DIR, "fern-ir"),
            generateFiles: ({ directory, intermediateRepresentation }) => {
                generateModelFiles({
                    directory,
                    intermediateRepresentation,
                });
            },
        });
    }, 60_000);
});
