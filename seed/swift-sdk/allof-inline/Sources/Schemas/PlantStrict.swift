import Foundation

public struct PlantStrict: Codable, Hashable, Sendable {
    /// The botanical species name.
    public let species: String
    /// The botanical family.
    public let family: String
    /// The botanical genus.
    public let genus: String
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        species: String,
        family: String,
        genus: String,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.species = species
        self.family = family
        self.genus = genus
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.species = try container.decode(String.self, forKey: .species)
        self.family = try container.decode(String.self, forKey: .family)
        self.genus = try container.decode(String.self, forKey: .genus)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.species, forKey: .species)
        try container.encode(self.family, forKey: .family)
        try container.encode(self.genus, forKey: .genus)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case species
        case family
        case genus
    }
}