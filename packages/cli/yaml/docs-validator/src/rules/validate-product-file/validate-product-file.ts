import { Rule } from "../../Rule"
import { validateProductConfigFileSchema } from "../../docsAst/validateProductConfig"

export const ValidateProductFileRule: Rule = {
    name: "validate-product-file",
    create: () => {
        return {
            productFile: async ({ path, content }) => {
                const parseResult = await validateProductConfigFileSchema({ value: content })
                if (parseResult.type === "success") {
                    return []
                }
                return [
                    {
                        severity: "fatal",
                        message: `${parseResult.message}`
                    }
                ]
            }
        }
    }
}
