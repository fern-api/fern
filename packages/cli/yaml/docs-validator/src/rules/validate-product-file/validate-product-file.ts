import { validateProductConfigFileSchema } from "../../docsAst/validateProductConfig";
import { Rule } from "../../Rule";

export const ValidateProductFileRule: Rule = {
    name: "validate-product-file",
    create: () => {
        return {
            productFile: async ({ content, absoluteFilepath, sourceMap }) => {
                const parseResult = await validateProductConfigFileSchema({
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
