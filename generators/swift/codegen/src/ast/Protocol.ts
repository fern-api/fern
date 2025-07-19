export const Protocol = {
    Codable: "Codable",
    Equatable: "Equatable",
    Hashable: "Hashable",
    CaseIterable: "CaseIterable",
    CodingKey: "CodingKey",
    Sendable: "Sendable"
} as const;

export type Protocol = (typeof Protocol)[keyof typeof Protocol];
