export type RelativeFilePath = `${NON_SLASH_CHARACTERS[number] | Lowercase<NON_SLASH_CHARACTERS[number]>}${string}`;

export const RelativeFilePath = {
    of: (value: string): RelativeFilePath => {
        if (value.startsWith("/")) {
            throw new Error("Filepath is not relative: " + value);
        }
        return value as RelativeFilePath;
    },
};

export type NON_SLASH_CHARACTERS = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
    ".",
    "_"
];
