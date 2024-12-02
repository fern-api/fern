export const NUMERIC_REGEX = /^(\d+)/;
export const VALID_ENUM_NAME_REGEX = /^[a-zA-Z][a-zA-Z0-9_]*$/;

export const HARDCODED_ENUM_NAMES: Record<string, string> = {
    "<": "LESS_THAN",
    ">": "GREATER_THAN",
    ">=": "GREATER_THAN_OR_EQUAL_TO",
    "<=": "LESS_THAN_OR_EQUAL_TO",
    "!=": "NOT_EQUALS",
    "=": "EQUAL_TO",
    "==": "EQUAL_TO",
    "*": "ALL",
    "": "EMPTY",
    '""': "EMPTY_STRING",
    "-": "HYPHEN",
    "|": "PIPE",
    ".": "DOT",
    "/": "SLASH"
};