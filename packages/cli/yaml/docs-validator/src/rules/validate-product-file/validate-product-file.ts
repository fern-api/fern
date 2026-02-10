import { validateProductConfigFileSchema } from "../../docsAst/validateProductConfig.js";
import { Rule } from "../../Rule.js";

export const ValidateProductFileRule: Rule = {
    name: "validate-product-file",
    create: () => {
        return {
            productFile: async ({ path, content }) => {
                const parseResult = await validateProductConfigFileSchema({ value: content });
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
