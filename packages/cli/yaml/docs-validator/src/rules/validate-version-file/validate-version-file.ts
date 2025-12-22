import { validateVersionConfigFileSchema } from "../../docsAst/validateVersionConfig";
import { Rule } from "../../Rule";

export const ValidateVersionFileRule: Rule = {
    name: "validate-version-file",
    create: () => {
        return {
            versionFile: async ({ content, absoluteFilepath, sourceMap }) => {
                const parseResult = await validateVersionConfigFileSchema({
                    value: content,
                    filePath: absoluteFilepath,
                    sourceMap
                });
                if (parseResult.type === "success") {
                    return [];
                }
                return [
                    {
                        severity: "fatal",
                        message: `${parseResult.message}`
                    }
                ];
            }
        };
    }
};
