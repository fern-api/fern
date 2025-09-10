export const Protocol = {
    CaseIterable: "CaseIterable",
    Codable: "Codable",
    CodingKey: "CodingKey",
    Decodable: "Decodable",
    Encodable: "Encodable",
    Equatable: "Equatable",
    Error: "Error",
    Hashable: "Hashable",
    Sendable: "Sendable"
} as const;

export type Protocol = (typeof Protocol)[keyof typeof Protocol];
