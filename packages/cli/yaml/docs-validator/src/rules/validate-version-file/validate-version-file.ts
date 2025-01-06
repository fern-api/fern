import { Rule } from "../../Rule";
import { validateVersionConfigFileSchema } from "../../docsAst/validateVersionConfig";

export const ValidateVersionFileRule: Rule = {
    name: "validate-version-file",
    create: () => {
        return {
            versionFile: async ({ path, content }) => {
                const parseResult = await validateVersionConfigFileSchema({ value: content });
                if (parseResult.type === "success") {
                    return [];
                }
                return [
                    {
                        severity: "error",
                        message: `Failed to parse ${path}: ${parseResult.message}`
                    }
                ];
            }
        };
    }
};
