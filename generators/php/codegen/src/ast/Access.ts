export type Access = "public" | "private" | "protected";

export const Access = {
    Public: "public",
    Private: "private",
    Protected: "protected"
} as const;
