import { Rule } from "../../Rule";
import { validateVersionConfigFileSchema } from "../../docsAst/validateVersionConfig";

const RULE_NAME = "validate-version-file";

export const ValidateVersionFileRule: Rule = {
    name: RULE_NAME,
    create: () => {
        return {
            versionFile: async ({ path, content }) => {
                const parseResult = await validateVersionConfigFileSchema({ value: content });
                if (parseResult.type === "success") {
                    return [];
                }
                return [
                    {
                        name: RULE_NAME,
                        severity: "fatal",
                        message: `Failed to parse ${path}: ${parseResult.message}`
                    }
                ];
            }
        };
    }
};
