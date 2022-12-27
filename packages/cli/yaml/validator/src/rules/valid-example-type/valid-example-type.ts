import { constructFernFileContext, TypeResolverImpl } from "@fern-api/ir-generator";
import { Rule } from "../../Rule";
import { CASINGS_GENERATOR } from "../../utils/casingsGenerator";
import { validateTypeExample } from "./validateTypeExample";

export const ValidExampleTypeRule: Rule = {
    name: "valid-example-type",
    create: ({ workspace }) => {
        const typeResolver = new TypeResolverImpl(workspace);

        return {
            serviceFile: {
                exampleType: ({ typeName, typeDeclaration, example }, { relativeFilepath, contents: serviceFile }) => {
                    return validateTypeExample({
                        typeName,
                        typeDeclaration,
                        example: example.value,
                        file: constructFernFileContext({
                            relativeFilepath,
                            serviceFile,
                            casingsGenerator: CASINGS_GENERATOR,
                        }),
                        typeResolver,
                        workspace,
                    });
                },
            },
        };
    },
};
