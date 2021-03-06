import { doesPathExist } from "@fern-api/core-utils";
import { exec } from "child_process";
import { mkdir, rm } from "fs/promises";
import path from "path";
import { promisify } from "util";
import { runDocker } from "../runDocker";

const promisifiedExec = promisify(exec);

const BASIC_WRITER_DIR = path.join(__dirname, "resources", "basic-writer");
const HOST_OUTPUT_DIR = path.join(BASIC_WRITER_DIR, "host-output");

const BASIC_WRITER_IMAGE_NAME = "basic-writer";
const IMAGE_OUTPUT_DIR = "/image-output";

beforeAll(async () => {
    // build docker
    await promisifiedExec(
        `docker build -f ${path.join(BASIC_WRITER_DIR, "Dockerfile")} -t ${BASIC_WRITER_IMAGE_NAME} ${BASIC_WRITER_DIR}`
    );

    // delete and remake host's output dir
    await rm(HOST_OUTPUT_DIR, { recursive: true, force: true });
    await mkdir(HOST_OUTPUT_DIR);
}, 60_000);

describe("runDocker", () => {
    it("basic-writer", async () => {
        const expectedOutputFileName = "my-file.txt";

        await runDocker({
            imageName: BASIC_WRITER_IMAGE_NAME,
            args: [expectedOutputFileName],
            binds: [`${HOST_OUTPUT_DIR}:${IMAGE_OUTPUT_DIR}`],
        });

        const fileExists = await doesPathExist(path.join(HOST_OUTPUT_DIR, expectedOutputFileName));
        expect(fileExists).toBe(true);
    }, 15_000);
});
