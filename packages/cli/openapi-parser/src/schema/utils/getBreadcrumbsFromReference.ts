export function getBreadcrumbsFromReference(reference: string): string[] {
    let breadcrumbs = reference.split("/").map((breadcrumb) => breadcrumb.replace(/~1/g, "/"));
    
    // create map of key value pairs where the key is a function that takes in the breadcrumbs array,
    // checks if the strategy is applicable to the array and the value is the strategy function
    // that manipulates the breadcrumbs array and returns the output array for the next strategy
    const strategies = [
        {
            // if the first three breadcrumbs are "#", "components", "schemas"
            isApplicable: (breadcrumbs: string[]) => breadcrumbs[0] === "#" && breadcrumbs[1] === "components" && breadcrumbs[2] === "schemas",
            applyStrategy: (breadcrumbs: string[]) => {
                // remove the first three breadcrumbs from the array
                breadcrumbs.slice(3);

                return breadcrumbs;
            }
        },
        {
            // if the first three breadcrumbs are "#", "components", "responses"
            isApplicable: (breadcrumbs: string[]) => breadcrumbs[0] === "#" && breadcrumbs[1] === "components" && breadcrumbs[2] === "responses",
            applyStrategy: (breadcrumbs: string[]) => {
                // remove the first three breadcrumbs from the array
                return breadcrumbs.slice(3);
            }
        },
        {
            // if the last element is "schema", remove it
            isApplicable: (breadcrumbs: string[]) => breadcrumbs[breadcrumbs.length - 1] === "schema",
            applyStrategy: (breadcrumbs: string[]) => {
                // remove the last element from the array
                return breadcrumbs.slice(0, breadcrumbs.length - 1);
            }
        },
        {
            // if there are any empty strings, remove them
            isApplicable: (breadcrumbs: string[]) => breadcrumbs.includes(""),
            applyStrategy: (breadcrumbs: string[]) => {
                // remove all empty strings from the array
                return breadcrumbs.filter((breadcrumb) => breadcrumb !== "");
            }
        },
        {
            // if "content" and "application/json" appear directly after one another in sequence, remove them
            isApplicable: (breadcrumbs: string[]) => breadcrumbs.join("").includes("contentapplication/json"),
            applyStrategy: (breadcrumbs: string[]) => {
                // find the index of "content" and "application/json" in the array
                for (let i = 0; i < breadcrumbs.length - 1; i++) {
                    if (breadcrumbs[i] === "content" && breadcrumbs[i + 1] === "application/json") {
                        breadcrumbs.splice(i, 2); // Remove "content" and "application/json"
                    }
                }

                return breadcrumbs;
            }
        }
    ];

    // apply the strategies in a loop until the breadcrumbs array has gone through an entire iteration with no changes
    let previousBreadcrumbs;
    do {
        previousBreadcrumbs = breadcrumbs;
        for (const strategy of strategies) {
            if (strategy.isApplicable(breadcrumbs)) {
                breadcrumbs = strategy.applyStrategy(breadcrumbs);
            }
        }
    } while (previousBreadcrumbs.join("") !== breadcrumbs.join(""));

    return breadcrumbs;
}