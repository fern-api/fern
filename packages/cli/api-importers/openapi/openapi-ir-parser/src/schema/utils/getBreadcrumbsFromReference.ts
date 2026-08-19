export interface Strategy {
    isApplicable: (refUnderProcessing: string[]) => boolean;
    applyStrategy: (refUnderProcessing: string[]) => { refUnderProcessing: string[]; newBreadcrumbs: string[] };
}

export const STARTS_WITH_COMPONENTS_SCHEMAS: Strategy = {
    // if the first three breadcrumbs are "#", "components", "schemas"
    // then the fourth breadcrumb will be a user-defined value that we want to extract
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
    // then the fourth breadcrumb will be a user-defined value that we want to extract
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
    // then the fourth breadcrumb will be a user-defined value that we want to extract
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
    // then the second breadcrumb will be a user-defined value that we want to extract
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
    // then we want to remove it from the breadcrumbs array
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
    // then we want to remove it from the breadcrumbs array
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
    // then we want to remove it from the breadcrumbs array
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
    // then we want to remove it from the breadcrumbs array
    isApplicable: (refUnderProcessing: string[]) => refUnderProcessing[0] === "oneOf",
    applyStrategy: (refUnderProcessing: string[]) => {
        return {
            refUnderProcessing: refUnderProcessing.slice(1),
            newBreadcrumbs: []
        };
    }
};

export function getBreadcrumbsFromReference(reference: string): string[] {
    let refUnderProcessing = reference.split("/").map((breadcrumb) => breadcrumb.replace(/~1/g, "/"));
    let breadcrumbs: string[] = [];

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
