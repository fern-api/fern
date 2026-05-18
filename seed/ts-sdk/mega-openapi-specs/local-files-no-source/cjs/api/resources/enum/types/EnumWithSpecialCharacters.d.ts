export declare const EnumWithSpecialCharacters: {
    readonly Bla: "\\$bla";
    readonly Yo: "\\$yo";
};
export type EnumWithSpecialCharacters = (typeof EnumWithSpecialCharacters)[keyof typeof EnumWithSpecialCharacters];
