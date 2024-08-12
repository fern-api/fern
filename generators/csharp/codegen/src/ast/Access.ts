export type Access = "public" | "private" | "protected" | "internal";

export const Access = {
    Public: "public",
    Private: "private",
    Protected: "protected",
    Internal: "internal"
} as const;
