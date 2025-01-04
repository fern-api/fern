import chalk from "chalk";

import { ExampleResolverImpl, TypeResolverImpl, constructFernFileContext } from "@fern-api/ir-generator";

import { Rule } from "../../Rule";
import { CASINGS_GENERATOR } from "../../utils/casingsGenerator";

export const NoUndefinedExampleReferenceRule: Rule = {
    name: "no-undefined-example-reference",
    create: ({ workspace }) => {
        const exampleResolver = new ExampleResolverImpl(new TypeResolverImpl(workspace));

        return {
            definitionFile: {
                exampleTypeReference: (exampleReference, { relativeFilepath, contents }) => {
                    if (exampleResolver.parseExampleReference(exampleReference) == null) {
                        return [
                            {
                                severity: "error",
                                message: `Example ${chalk.bold(
                                    exampleReference
                                )} is malformed. Examples should be formatted like ${chalk.bold(
                                    "$YourType.ExampleName"
                                )}`
                            }
                        ];
                    }

                    const doesExist =
                        exampleResolver.resolveExample({
                            example: exampleReference,
                            file: constructFernFileContext({
                                relativeFilepath,
                                definitionFile: contents,
                                casingsGenerator: CASINGS_GENERATOR,
                                rootApiFile: workspace.definition.rootApiFile.contents
                            })
                        }) != null;

                    if (doesExist) {
                        return [];
                    } else {
                        return [
                            {
                                severity: "error",
                                message: `Example ${chalk.bold(exampleReference)} is not defined.`
                            }
                        ];
                    }
                }
            }
        };
    }
};
