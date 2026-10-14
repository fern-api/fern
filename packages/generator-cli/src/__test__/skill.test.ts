import { getSkillDirectory, getSkillName } from "../skill/SkillGenerator.js";
import { default as ADVANCED } from "./fixtures/advanced/readme.js";
import { default as BASIC_JAVA } from "./fixtures/basic-java/readme.js";
import { default as COHERE_GO } from "./fixtures/cohere-go/readme.js";
import { default as MIXED_SNIPPETS } from "./fixtures/mixed-snippets/readme.js";
import { testGenerateSkill } from "./testGenerateSkill.js";

describe("generate skill", () => {
    testGenerateSkill({ fixtureName: "cohere-go", config: COHERE_GO });
    testGenerateSkill({ fixtureName: "basic-java", config: BASIC_JAVA });
    testGenerateSkill({ fixtureName: "advanced", config: ADVANCED });
    testGenerateSkill({ fixtureName: "mixed-snippets", config: MIXED_SNIPPETS });

    it("derives a valid skill name and directory", () => {
        expect(getSkillName(COHERE_GO)).toBe("cohere-go-sdk");
        expect(getSkillName(ADVANCED)).toBe("imdb-inc-typescript-sdk");
        expect(getSkillDirectory(ADVANCED)).toBe(".agents/skills/imdb-inc-typescript-sdk");
        expect(
            getSkillName({ ...ADVANCED, apiName: undefined, organization: "A".repeat(80) }).length
        ).toBeLessThanOrEqual(64);
    });
});
