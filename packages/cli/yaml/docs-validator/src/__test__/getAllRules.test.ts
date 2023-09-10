import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { readdir } from "fs/promises";
import { camelCase, upperFirst } from "lodash-es";
import { getAllRules, getAllRulesForTest } from "../getAllRules";
import { Rule } from "../Rule";

const RULES_DIRECTORY = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("../rules"));

describe("getAllRules", () => {
    it("ensure all docs validation rules are registered", async () => {
        const allRulesPromises = (await readdir(RULES_DIRECTORY, { withFileTypes: true }))
            .filter((item) => item.isDirectory())
            .filter((iterm) => iterm.name !== "valid-markdown") // jest doesnt like next-mdx
            .map(async (item) => {
                const fullPath = join(RULES_DIRECTORY, RelativeFilePath.of(item.name));
                const imported = await import(fullPath);
                const ruleName = `${upperFirst(camelCase(item.name))}Rule`;
                const rule = imported[ruleName];
                if (rule == null) {
                    throw new Error("Rule does not exist: " + ruleName);
                }
                return rule as Rule;
            });
        const allRules: Rule[] = await Promise.all(allRulesPromises);

        const registeredRules = getAllRulesForTest();

        expect(allRules.length).toEqual(registeredRules.length);
        for (const rule of allRules) {
            expect(registeredRules).toContainEqual(
                expect.objectContaining({
                    name: rule.name,
                })
            );
        }
    });

    it("ensure docs validation rule names are unique", () => {
        const rules = getAllRules();
        for (const { name } of rules) {
            const rulesWithName = rules.filter((rule) => rule.name === name);
            expect(rulesWithName).toHaveLength(1);
        }
    });
});
