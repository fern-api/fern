import { RawSchemas } from "@fern-api/yaml-schema";
import { writeFile } from "fs/promises";
import yaml from "js-yaml";
import path from "path";
import { SAMPLE_API } from "./sampleApi";

const rawApi = yaml.load(SAMPLE_API);
void RawSchemas.ServiceFileSchema.parseAsync(rawApi);

export async function writeSampleApiToDirectory(dir: string): Promise<void> {
    await writeFile(path.join(dir, API_FILENAME), SAMPLE_API);
}

const API_FILENAME = "api.yml";
