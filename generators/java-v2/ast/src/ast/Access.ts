export const Access = {
    Public: "public",
    Protected: "protected",
    Private: "private"
} as const

export type Access = (typeof Access)[keyof typeof Access]
