import type fs from "fs";

import type { FernGeneratorCli } from "../configuration/sdk/index.js";
import { SkillGenerator } from "../skill/SkillGenerator.js";

export { getSkillDirectory, getSkillName, SKILL_FILENAME, SKILLS_DIRECTORY } from "../skill/SkillGenerator.js";

export interface GenerateSkillToStreamParams {
    readmeConfig: FernGeneratorCli.ReadmeConfig;
    outputStream: fs.WriteStream | NodeJS.Process["stdout"];
}

export async function generateSkillToStream(params: GenerateSkillToStreamParams): Promise<void> {
    const { readmeConfig, outputStream } = params;
    const generator = new SkillGenerator({ readmeConfig });
    await generator.generateSkill({ output: outputStream });
}

export interface GenerateSkillParams {
    readmeConfig: FernGeneratorCli.ReadmeConfig;
}

export async function generateSkill(params: GenerateSkillParams): Promise<string> {
    const generator = new SkillGenerator({ readmeConfig: params.readmeConfig });
    return generator.generateSkillToString();
}
