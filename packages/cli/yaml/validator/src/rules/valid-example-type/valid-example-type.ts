import { constructFernFileContext, ExampleResolverImpl, TypeResolverImpl } from "@fern-api/ir-generator";
import { Rule } from "../../Rule";
import { CASINGS_GENERATOR } from "../../utils/casingsGenerator";
import { validateTypeExample } from "./validateTypeExample";

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
                    return validateTypeExample({
                        typeName,
                        typeDeclaration,
                        example: example.value,
                        file: constructFernFileContext({
                            relativeFilepath,
                            definitionFile,
                            casingsGenerator: CASINGS_GENERATOR,
                            rootApiFile: workspace.definition.rootApiFile.contents,
                        }),
                        typeResolver,
                        exampleResolver,
                        workspace,
                    });
                },
            },
        };
    },
};
