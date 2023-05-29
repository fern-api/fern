// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
export function getReferenceOccurrences(document: any): Record<string, number> {
    const occurrences: Record<string, number> = {};
    getReferenceOccurrencesHelper({ obj: document, occurrences });
    return occurrences;
}

function getReferenceOccurrencesHelper({
    obj,
    occurrences: references,
}: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    obj: any;
    occurrences: Record<string, number>;
}): void {
    if (obj == null) {
        return;
    }

    if (Array.isArray(obj)) {
        for (const element of obj) {
            getReferenceOccurrencesHelper(element);
        }
    }

    if (typeof obj !== "object" || obj == null) {
        return;
    }

    if (obj.$ref != null && typeof obj.$ref === "string") {
        const refProperty = obj.$ref;
        if (references[refProperty] == null) {
            references[refProperty] = 1;
        } else {
            references[refProperty] += 1;
        }
    }

    // Recursively check each property
    for (const key in obj) {
        getReferenceOccurrencesHelper(obj[key]);
    }
}
