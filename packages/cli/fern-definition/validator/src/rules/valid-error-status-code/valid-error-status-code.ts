import { parseErrorStatusCode } from "@fern-api/fern-definition-schema";
import { Rule } from "../../Rule.js";

export const ValidErrorStatusCodeRule: Rule = {
    name: "valid-error-status-code",
    create: () => {
        return {
            definitionFile: {
                errorDeclaration: ({ errorName, declaration }) => {
                    const statusCode = declaration["status-code"];
                    if (parseErrorStatusCode(statusCode) != null) {
                        return [];
                    }
                    return [
                        {
                            severity: "fatal",
                            message: `Error ${errorName} has an invalid status-code "${statusCode}". Expected an integer, "4XX", or "5XX".`
                        }
                    ];
                }
            }
        };
    }
};
