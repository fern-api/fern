export type Access = "public" | "public readonly" | "protected" | "private";

export const Access = {
    Public: "public",
    PublicReadonly: "public readonly",
    Protected: "protected",
    Private: "private"
} as const;
