import { readdir } from "fs/promises";
import path from "path";
import { getAllRules } from "../getAllRules";
import { Rule } from "../Rule";

const RULES_DIRECTORY = path.join(__dirname, "../rules");

describe("getAllRules", () => {
    it("ensure all rules are registered", async () => {
        const allRulesPromises = (await readdir(RULES_DIRECTORY, { withFileTypes: true }))
            .filter((item) => item.isDirectory())
            .map(async (item): Promise<Rule> => {
                const fullPath = path.join(RULES_DIRECTORY, item.name);
                const imported = await import(fullPath);
                return imported.default;
            });
        const allRules: Rule[] = await Promise.all(allRulesPromises);

        const registeredRules = getAllRules();

        expect(allRules.length).toEqual(registeredRules.length);
        for (const rule of allRules) {
            expect(registeredRules).toContainEqual(
                expect.objectContaining({
                    name: rule.name,
                })
            );
        }
    });
});
