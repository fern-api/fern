const LIST_TYPE = "list";

export function isInlinedListType(typeReference: string): boolean {
    return typeReference === LIST_TYPE;
}
