import { ComplexQueryParamTypeDetector } from "../../ComplexQueryParamTypeDetector";
import { Rule } from "../../Rule";

export const NoComplexQueryParamsRule: Rule = {
    name: "no-complex-query-params",
    create: ({ workspace }) => {
        const complexTypeDetector = new ComplexQueryParamTypeDetector(workspace);

        return {
            definitionFile: {
                queryParameter: async ({ queryParameter }, ruleRunnerArgs) => {
                    const type = typeof queryParameter === "string" ? queryParameter : queryParameter.type;

                    const isComplex = await complexTypeDetector.isTypeComplex(type, ruleRunnerArgs);
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
