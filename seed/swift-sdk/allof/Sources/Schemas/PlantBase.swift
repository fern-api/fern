import Foundation

public struct PlantBase: Codable, Hashable, Sendable {
    /// The botanical species name.
    public let species: String
    /// The botanical family.
    public let family: String
    /// The botanical genus.
    public let genus: String
    /// The common name of the plant.
    public let commonName: String?
    public let wateringFrequency: PlantBaseWateringFrequency?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        species: String,
        family: String,
        genus: String,
        commonName: String? = nil,
        wateringFrequency: PlantBaseWateringFrequency? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.species = species
        self.family = family
        self.genus = genus
        self.commonName = commonName
        self.wateringFrequency = wateringFrequency
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.species = try container.decode(String.self, forKey: .species)
        self.family = try container.decode(String.self, forKey: .family)
        self.genus = try container.decode(String.self, forKey: .genus)
        self.commonName = try container.decodeIfPresent(String.self, forKey: .commonName)
        self.wateringFrequency = try container.decodeIfPresent(PlantBaseWateringFrequency.self, forKey: .wateringFrequency)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.species, forKey: .species)
        try container.encode(self.family, forKey: .family)
        try container.encode(self.genus, forKey: .genus)
        try container.encodeIfPresent(self.commonName, forKey: .commonName)
        try container.encodeIfPresent(self.wateringFrequency, forKey: .wateringFrequency)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case species
        case family
        case genus
        case commonName
        case wateringFrequency
    }
}