import { readdir } from "fs/promises";
import { camelCase, upperFirst } from "lodash-es";

import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";

import { Rule } from "../Rule";
import { getAllRules } from "../getAllRules";

const RULES_DIRECTORY = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("../rules"));

describe("getAllRules", () => {
    it("ensure all rules are registered", async () => {
        const allRulesPromises = (await readdir(RULES_DIRECTORY, { withFileTypes: true }))
            .filter((item) => item.isDirectory())
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

        const allRules = await Promise.all(allRulesPromises);
        const registeredRules = getAllRules();

        expect(allRules.length).toEqual(registeredRules.length);
        for (const rule of allRules) {
            expect(registeredRules).toContainEqual(
                expect.objectContaining({
                    name: rule.name
                })
            );
        }
    });

    it("ensure rule names are unique", () => {
        const rules = getAllRules();
        for (const { name } of rules) {
            const rulesWithName = rules.filter((rule) => rule.name === name);
            expect(rulesWithName).toHaveLength(1);
        }
    });
});
