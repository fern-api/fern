import { constructFernFileContext, ExampleResolverImpl, TypeResolverImpl } from "@fern-api/ir-generator";
import chalk from "chalk";
import { Rule } from "../../Rule";
import { CASINGS_GENERATOR } from "../../utils/casingsGenerator";

export const NoUndefinedExampleReferenceRule: Rule = {
    name: "no-undefined-example-reference",
    create: async ({ workspace }) => {
        const exampleResolver = new ExampleResolverImpl(new TypeResolverImpl(workspace));

        return {
            serviceFile: {
                exampleTypeReference: (exampleReference, { relativeFilepath, contents }) => {
                    if (exampleResolver.parseExampleReference(exampleReference) == null) {
                        return [
                            {
                                severity: "error",
                                message: `Example ${chalk.bold(
                                    exampleReference
                                )} is malformed. Examples should be formatted like ${chalk.bold(
                                    "$YourType.ExampleName"
                                )}`,
                            },
                        ];
                    }

                    const doesExist =
                        exampleResolver.resolveExample({
                            referenceToExample: exampleReference,
                            file: constructFernFileContext({
                                relativeFilepath,
                                serviceFile: contents,
                                casingsGenerator: CASINGS_GENERATOR,
                            }),
                        }) != null;

                    if (doesExist) {
                        return [];
                    } else {
                        return [
                            {
                                severity: "error",
                                message: `Example ${chalk.bold(exampleReference)} is not defined.`,
                            },
                        ];
                    }
                },
            },
        };
    },
};
