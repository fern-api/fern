import { ComplexTypeDetector } from "../../ComplexTypeDetector";
import { Rule } from "../../Rule";

export const NoComplexQueryParamsRule: Rule = {
    name: "no-complex-query-params",
    create: ({ workspace }) => {
        const complexTypeDetector = new ComplexTypeDetector(workspace);

        return {
            definitionFile: {
                queryParameter: ({ queryParameter }, ruleRunnerArgs) => {
                    const type = typeof queryParameter === "string" ? queryParameter : queryParameter.type;

                    const isComplex = complexTypeDetector.isTypeComplex(type, ruleRunnerArgs);
                    if (isComplex != null && isComplex) {
                        return [
                            {
                                severity: "error",
                                message: `${type} is not a valid type for a query parameter`
                            }
                        ];
                    }
                    return [];
                }
            }
        };
    }
};
