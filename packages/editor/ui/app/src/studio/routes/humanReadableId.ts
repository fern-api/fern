const UUID_V4_LENGTH = 36;

const NON_URL_SAFE_CHARACTER_REGEX = /[^a-zA-Z0-9-_]/g;

export function addHumanReadablePrefixToId({
    id,
    humanReadablePrefix,
}: {
    id: string;
    humanReadablePrefix: string | undefined;
}): string {
    if (humanReadablePrefix == null) {
        return id;
    }
    return `${humanReadablePrefix.replaceAll(" ", "-").replaceAll(NON_URL_SAFE_CHARACTER_REGEX, "")}-${id}`;
}

export function removeHumanReadablePrefixFromId(id: string): string {
    return id.slice(-UUID_V4_LENGTH);
}
