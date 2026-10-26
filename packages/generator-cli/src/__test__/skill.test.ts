import { getSkillDirectory, getSkillName } from "../skill/SkillGenerator.js";
import { default as ADVANCED } from "./fixtures/advanced/readme.js";
import { default as BASIC_JAVA } from "./fixtures/basic-java/readme.js";
import { default as COHERE_GO } from "./fixtures/cohere-go/readme.js";
import { basicConfig as CUSTOM_SECTIONS_TYPESCRIPT } from "./fixtures/custom-sections/typescript.js";
import { default as MIXED_SNIPPETS } from "./fixtures/mixed-snippets/readme.js";
import { default as REFERENCE_MD } from "./fixtures/reference-md/readme.js";
import { testGenerateSkill } from "./testGenerateSkill.js";

describe("generate skill", () => {
    testGenerateSkill({ fixtureName: "cohere-go", config: COHERE_GO });
    testGenerateSkill({ fixtureName: "basic-java", config: BASIC_JAVA });
    testGenerateSkill({ fixtureName: "advanced", config: ADVANCED });
    testGenerateSkill({ fixtureName: "mixed-snippets", config: MIXED_SNIPPETS });
    testGenerateSkill({ fixtureName: "reference-md", config: REFERENCE_MD });
    testGenerateSkill({ fixtureName: "custom-sections-typescript", config: CUSTOM_SECTIONS_TYPESCRIPT });

    it("derives a valid skill name and directory", () => {
        expect(getSkillName(COHERE_GO)).toBe("cohere-go-sdk");
        expect(getSkillName(ADVANCED)).toBe("imdb-inc-typescript-sdk");
        expect(getSkillDirectory(ADVANCED)).toBe(".agents/skills/imdb-inc-typescript-sdk");
        const first = getSkillName({ ...ADVANCED, apiName: `${"A".repeat(60)}First` });
        const second = getSkillName({ ...ADVANCED, apiName: `${"A".repeat(60)}Second` });
        expect(first.length).toBeLessThanOrEqual(64);
        expect(first).toMatch(/^a{42}-[0-9a-f]{6}-typescript-sdk$/);
        expect(first).not.toBe(second);
        expect(getSkillName({ ...ADVANCED, apiName: `${"A".repeat(60)}First` })).toBe(first);
    });
});
