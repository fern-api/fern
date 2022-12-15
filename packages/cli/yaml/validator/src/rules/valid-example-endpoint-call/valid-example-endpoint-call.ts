import { constructFernFileContext, TypeResolverImpl } from "@fern-api/ir-generator";
import { Rule, RuleViolation } from "../../Rule";
import { CASINGS_GENERATOR } from "../../utils/casingsGenerator";
import { validateHeaders } from "./validateHeaders";
import { validatePathParameters } from "./validatePathParameters";
import { validateQueryParameters } from "./validateQueryParameters";

export const ValidExampleEndpointCallRule: Rule = {
    name: "valid-example-endpoint-call",
    create: ({ workspace }) => {
        const typeResolver = new TypeResolverImpl(workspace);
        return {
            serviceFile: {
                exampleHttpEndpointCall: (
                    { service, endpoint, example },
                    { relativeFilepath, contents: serviceFile }
                ) => {
                    const violations: RuleViolation[] = [];

                    const file = constructFernFileContext({
                        relativeFilepath,
                        serviceFile,
                        casingsGenerator: CASINGS_GENERATOR,
                    });

                    violations.push(
                        ...validateHeaders({
                            service,
                            endpoint,
                            example,
                            typeResolver,
                            workspace,
                            file,
                        })
                    );

                    violations.push(
                        ...validatePathParameters({
                            service,
                            endpoint,
                            example,
                            typeResolver,
                            workspace,
                            file,
                        })
                    );

                    violations.push(
                        ...validateQueryParameters({
                            endpoint,
                            example,
                            typeResolver,
                            workspace,
                            file,
                        })
                    );

                    return violations;
                },
            },
        };
    },
};
