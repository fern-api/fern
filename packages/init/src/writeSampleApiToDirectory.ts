import { RawSchemas } from "@fern-api/syntax-analysis";
import { writeFile } from "fs/promises";
import yaml from "js-yaml";
import path from "path";
import { SAMPLE_API } from "./sampleApi";

const rawApi = yaml.load(SAMPLE_API);
void RawSchemas.FernConfigurationSchema.parseAsync(rawApi);

export async function writeSampleApiToDirectory(dir: string): Promise<void> {
    await writeFile(path.join(dir, API_FILENAME), SAMPLE_API);
}

const API_FILENAME = "api.yml";
