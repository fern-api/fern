import {
    ExampleResolverImpl,
    ExampleValidators,
    TypeResolverImpl,
    constructFernFileContext
} from "@fern-api/ir-generator";

import { Rule } from "../../Rule";
import { CASINGS_GENERATOR } from "../../utils/casingsGenerator";

export const ValidExampleTypeRule: Rule = {
    name: "valid-example-type",
    create: ({ workspace }) => {
        const typeResolver = new TypeResolverImpl(workspace);
        const exampleResolver = new ExampleResolverImpl(typeResolver);

        return {
            definitionFile: {
                exampleType: (
                    { typeName, typeDeclaration, example },
                    { relativeFilepath, contents: definitionFile }
                ) => {
                    const violations = ExampleValidators.validateTypeExample({
                        typeName,
                        typeDeclaration,
                        example: example.value,
                        file: constructFernFileContext({
                            relativeFilepath,
                            definitionFile,
                            casingsGenerator: CASINGS_GENERATOR,
                            rootApiFile: workspace.definition.rootApiFile.contents
                        }),
                        typeResolver,
                        exampleResolver,
                        workspace,
                        breadcrumbs: [],
                        depth: 0
                    });
                    return violations.map((violation) => {
                        return {
                            severity: "error",
                            message: violation.message
                        };
                    });
                }
            }
        };
    }
};
