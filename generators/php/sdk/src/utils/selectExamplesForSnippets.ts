// `isUserSpecified` is set by the CLI dynamic-IR converter; widen here because older
// `@fern-fern/ir-sdk` typings don't yet expose the field.
export function selectExamplesForSnippets<T>(examples: readonly T[] | undefined): T[] {
    if (examples == null || examples.length === 0) {
        return [];
    }
    const tagged = examples as readonly (T & { isUserSpecified?: boolean })[];
    const userExamples = tagged.filter((example) => example.isUserSpecified === true);
    if (userExamples.length > 0) {
        return userExamples;
    }
    return tagged.filter((example) => example.isUserSpecified !== true).slice(0, 1);
}
