import { docsYml } from "@fern-api/configuration";
import { Rule } from "../../Rule";

export const ValidateVersionFileRule: Rule = {
    name: "validate-version-file",
    create: () => {
        return {
            versionFile: async ({ path, content }) => {
                const parseResult = await docsYml.RawSchemas.Visitors.validateVersionConfigFileSchema({
                    value: content
                });
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
