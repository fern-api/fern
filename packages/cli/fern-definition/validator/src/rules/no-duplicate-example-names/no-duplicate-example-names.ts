import { isNonNullish } from "@fern-api/core-utils";

import { Rule } from "../../Rule.js";
import { getDuplicates } from "../../utils/getDuplicates.js";

export const NoDuplicateExampleNamesRule: Rule = {
    name: "no-duplicate-example-names",
    create: () => {
        return {
            definitionFile: {
                typeDeclaration: ({ declaration }) => {
                    if (typeof declaration === "string" || declaration.examples == null) {
                        return [];
                    }
                    const allNames = declaration.examples.map((example) => example.name).filter(isNonNullish);
                    return getDuplicates(allNames).map((duplicate) => ({
                        severity: "fatal",
                        message: `Duplicate example name: ${duplicate}`
                    }));
                },
                httpEndpoint: ({ endpoint }) => {
                    if (endpoint.examples == null) {
                        return [];
                    }
                    const allNames = endpoint.examples.map((example) => example.name).filter(isNonNullish);
                    return getDuplicates(allNames).map((duplicate) => ({
                        severity: "fatal",
                        message: `Duplicate example name: ${duplicate}`
                    }));
                }
            }
        };
    }
};
