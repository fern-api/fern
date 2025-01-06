export const Access = {
    Public: "public",
    Private: "private",
    Protected: "protected",
    Internal: "internal"
} as const;

export type Access = (typeof Access)[keyof typeof Access];
