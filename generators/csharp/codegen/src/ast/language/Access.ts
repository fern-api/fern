export const Access = {
    Public: "public",
    Private: "private",
    PrivateProtected: "private protected",
    Protected: "protected",
    Internal: "internal"
} as const;

export type Access = (typeof Access)[keyof typeof Access];
