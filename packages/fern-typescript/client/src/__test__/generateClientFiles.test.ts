import { compile } from "@fern-api/compiler";
import { writeFiles } from "@fern-api/typescript-commons";
import { parseFernDirectory } from "fern-api";
import { rm } from "fs/promises";
import { vol } from "memfs";
import path from "path";
import { Project } from "ts-morph";
import { generateClientFiles } from "../generateClientFiles";

const MOCK_APIS_DIR = path.join(__dirname, "mocks");
const GENERATED_DIR = path.join(__dirname, "generated");

beforeAll(async () => {
    await rm(GENERATED_DIR, { recursive: true, force: true });
});

describe("generateClientFiles", () => {
    it("posts", async () => {
        const directory = path.join(MOCK_APIS_DIR, "posts");
        const generatedDir = path.join(directory, "generated");

        const files = await parseFernDirectory(path.join(directory, "src"));
        const compilerResult = await compile(files);
        if (!compilerResult.didSucceed) {
            throw new Error(JSON.stringify(compilerResult.failure));
        }

        const project = new Project({
            useInMemoryFileSystem: true,
        });

        generateClientFiles({
            directory: project.createDirectory("src"),
            intermediateRepresentation: compilerResult.intermediateRepresentation,
        });

        await writeFiles("/", project, vol.promises);
        expect(vol.toJSON()).toMatchSnapshot();

        await writeFiles(generatedDir, project);
    }, 15_000);
});
