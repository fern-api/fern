export type Access = "public" | "private" | "internal";

export const Access = {
    Public: "public",
    Private: "private",
    Internal: "internal"
} as const;
