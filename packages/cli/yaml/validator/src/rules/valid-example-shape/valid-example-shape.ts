import { constructFernFileContext, TypeResolverImpl } from "@fern-api/ir-generator";
import { Rule } from "../../Rule";
import { CASINGS_GENERATOR } from "../../utils/casingsGenerator";
import { validateTypeExample } from "./validateTypeExample";

export const ValidExampleShapeRule: Rule = {
    name: "valid-example",
    create: ({ workspace }) => {
        const typeResolver = new TypeResolverImpl(workspace);

        return {
            serviceFile: {
                typeExample: ({ typeDeclaration, example }, { relativeFilepath, contents: serviceFile }) => {
                    return validateTypeExample({
                        typeDeclaration,
                        example,
                        file: constructFernFileContext({
                            relativeFilepath,
                            serviceFile,
                            casingsGenerator: CASINGS_GENERATOR,
                        }),
                        typeResolver,
                    });
                },
            },
        };
    },
};
