export interface Strategy {
    isApplicable: (refUnderProcessing: string[]) => boolean;
    applyStrategy: (refUnderProcessing: string[]) => { refUnderProcessing: string[]; newBreadcrumbs: string[] };
}

export const STARTS_WITH_COMPONENTS_SCHEMAS: Strategy = {
    // if the first three breadcrumbs are "#", "components", "schemas"
    isApplicable: (refUnderProcessing: string[]) =>
        refUnderProcessing[0] === "#" && refUnderProcessing[1] === "components" && refUnderProcessing[2] === "schemas",
    applyStrategy: (refUnderProcessing: string[]) => {
        const newBreadcrumbs = [refUnderProcessing[3] ?? ""];

        return {
            refUnderProcessing: refUnderProcessing.slice(4),
            newBreadcrumbs
        };
    }
};

export const STARTS_WITH_COMPONENTS_RESPONSES: Strategy = {
    // if the first three breadcrumbs are "#", "components", "responses"
    isApplicable: (breadcrumbs: string[]) =>
        breadcrumbs[0] === "#" && breadcrumbs[1] === "components" && breadcrumbs[2] === "responses",
    applyStrategy: (refUnderProcessing: string[]) => {
        const newBreadcrumbs = [refUnderProcessing[3] ?? ""];

        refUnderProcessing = refUnderProcessing.slice(4);

        return {
            refUnderProcessing: refUnderProcessing.slice(4),
            newBreadcrumbs
        };
    }
};

export const STARTS_WITH_COMPONENTS_PARAMETERS: Strategy = {
    // if the first three breadcrumbs are "#", "components", "parameters"
    isApplicable: (refUnderProcessing: string[]) =>
        refUnderProcessing[0] === "#" &&
        refUnderProcessing[1] === "components" &&
        refUnderProcessing[2] === "parameters",
    applyStrategy: (refUnderProcessing: string[]) => {
        const newBreadcrumbs = [refUnderProcessing[3] ?? ""];

        refUnderProcessing = refUnderProcessing.slice(4);

        if (refUnderProcessing[0] === "schema") {
            refUnderProcessing = refUnderProcessing.slice(1);
        }

        return {
            refUnderProcessing,
            newBreadcrumbs
        };
    }
};

export const EXTRACT_PROPERTY: Strategy = {
    // if the first breadcrumb is "properties"
    isApplicable: (refUnderProcessing: string[]) => refUnderProcessing[0] === "properties",
    applyStrategy: (refUnderProcessing: string[]) => {
        const newBreadcrumbs = [refUnderProcessing[1] ?? ""];

        return {
            refUnderProcessing: refUnderProcessing.slice(2),
            newBreadcrumbs
        };
    }
};

export const REMOVE_ITEMS_KEYWORD: Strategy = {
    // if the first breadcrumb is "items"
    isApplicable: (refUnderProcessing: string[]) => refUnderProcessing[0] === "items",
    applyStrategy: (refUnderProcessing: string[]) => {
        return {
            refUnderProcessing: refUnderProcessing.slice(1),
            newBreadcrumbs: []
        };
    }
};

export const REMOVE_ALL_OF_KEYWORD: Strategy = {
    // if the first breadcrumb is "allOf"
    isApplicable: (refUnderProcessing: string[]) => refUnderProcessing[0] === "allOf",
    applyStrategy: (refUnderProcessing: string[]) => {
        return {
            refUnderProcessing: refUnderProcessing.slice(1),
            newBreadcrumbs: []
        };
    }
};

export const REMOVE_ANY_OF_KEYWORD: Strategy = {
    // if the first breadcrumb is "anyOf"
    isApplicable: (refUnderProcessing: string[]) => refUnderProcessing[0] === "anyOf",
    applyStrategy: (refUnderProcessing: string[]) => {
        return {
            refUnderProcessing: refUnderProcessing.slice(1),
            newBreadcrumbs: []
        };
    }
};

export const REMOVE_ONE_OF_KEYWORD: Strategy = {
    // if the first breadcrumb is "oneOf"
    isApplicable: (refUnderProcessing: string[]) => refUnderProcessing[0] === "oneOf",
    applyStrategy: (refUnderProcessing: string[]) => {
        return {
            refUnderProcessing: refUnderProcessing.slice(1),
            newBreadcrumbs: []
        };
    }
};

// export const ENDS_WITH_SCHEMA: Strategy = {
//     // if the last element is "schema", remove it
//     isApplicable: (breadcrumbs: string[]) => breadcrumbs[breadcrumbs.length - 1] === "schema",
//     applyStrategy: (refUnderProcessing: string[], newBreadcrumbs: string[]) => {
//         // remove the last element from the array
//         return breadcrumbs.slice(0, breadcrumbs.length - 1);
//     }
// };

// export const CONTAINS_EMPTY_STRINGS: Strategy = {
//     // if there are any empty strings, remove them
//     isApplicable: (breadcrumbs: string[]) => breadcrumbs.includes(""),
//     applyStrategy: (refUnderProcessing: string[], newBreadcrumbs: string[]) => {
//         // remove all empty strings from the array
//         return breadcrumbs.filter((breadcrumb) => breadcrumb !== "");
//     }
// };

// export const CONTAINS_CONTENT_APPLICATION_JSON_IN_SEQUENCE: Strategy = {
//     // if "content" and "application/json" appear directly after one another in sequence, remove them
//     isApplicable: (breadcrumbs: string[]) => breadcrumbs.join("").includes("contentapplication/json"),
//     applyStrategy: (refUnderProcessing: string[], newBreadcrumbs: string[]) => {
//         // find the index of "content" and "application/json" in the array
//         for (let i = 0; i < breadcrumbs.length - 1; i++) {
//             if (breadcrumbs[i] === "content" && breadcrumbs[i + 1] === "application/json") {
//                 breadcrumbs.splice(i, 2); // Remove "content" and "application/json"
//             }
//         }

//         return breadcrumbs;
//     }
// };

// export const CONTAINS_ITEMS_KEYWORD: Strategy = {
//     // if "properties" appears in the array, remove it
//     isApplicable: (breadcrumbs: string[]) => breadcrumbs.includes("items"),
//     applyStrategy: (refUnderProcessing: string[], newBreadcrumbs: string[]) => {
//         // remove any instance of "items" from the array UNLESS it is preceded by "items"
//         let i = 0;
//         while (i < breadcrumbs.length - 1) {
//             if (breadcrumbs[i] === "items" && breadcrumbs[i + 1] !== "items") {
//                 breadcrumbs.splice(i, 1); // Remove "items" if it's not preceded by another "items"
//             } else {
//                 i++;
//             }
//         }
//         return breadcrumbs;
//     }
// };

export function getBreadcrumbsFromReference(reference: string): string[] {
    let refUnderProcessing = reference.split("/").map((breadcrumb) => breadcrumb.replace(/~1/g, "/"));
    let breadcrumbs: string[] = [];

    // create map of key value pairs where the key is a function that takes in the breadcrumbs array,
    // checks if the strategy is applicable to the array and the value is the strategy function
    // that manipulates the breadcrumbs array and returns the output array for the next strategy
    const strategies = [
        // prefix strategies
        STARTS_WITH_COMPONENTS_SCHEMAS,
        STARTS_WITH_COMPONENTS_RESPONSES,
        STARTS_WITH_COMPONENTS_PARAMETERS,
        // index-aware strategies that must happen after prefix strategies
        EXTRACT_PROPERTY,
        REMOVE_ITEMS_KEYWORD,
        REMOVE_ALL_OF_KEYWORD,
        REMOVE_ANY_OF_KEYWORD,
        REMOVE_ONE_OF_KEYWORD
        // unordered strategies
        // CONTAINS_CONTENT_APPLICATION_JSON_IN_SEQUENCE,
        // cleanup strategies
        // CONTAINS_EMPTY_STRINGS,
        // ENDS_WITH_SCHEMA,
    ];

    // apply the strategies in a loop until the breadcrumbs array has gone through an entire iteration with no changes
    let previousRefUnderProcessing;
    do {
        previousRefUnderProcessing = refUnderProcessing;
        for (const strategy of strategies) {
            if (strategy.isApplicable(refUnderProcessing)) {
                const { refUnderProcessing: newRefUnderProcessing, newBreadcrumbs } =
                    strategy.applyStrategy(refUnderProcessing);
                refUnderProcessing = newRefUnderProcessing;
                breadcrumbs = [...breadcrumbs, ...newBreadcrumbs];
            }
        }
    } while (refUnderProcessing.join("") !== previousRefUnderProcessing.join(""));

    return breadcrumbs;
}
