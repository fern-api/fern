import Foundation

extension Requests {
    public struct PlantPost: Codable, Hashable, Sendable {
        /// The common name of the plant.
        public let commonName: String?
        public let wateringFrequency: PlantBaseWateringFrequency?
        /// The botanical species name.
        public let species: String
        /// The botanical family.
        public let family: String
        /// The botanical genus.
        public let genus: String
        /// Required sun exposure level.
        public let sunExposure: PlantPostSunExposure
        /// Date the plant was planted.
        public let plantedAt: CalendarDate?
        /// Preferred soil type.
        public let soilType: String?
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            commonName: String? = nil,
            wateringFrequency: PlantBaseWateringFrequency? = nil,
            species: String,
            family: String,
            genus: String,
            sunExposure: PlantPostSunExposure,
            plantedAt: CalendarDate? = nil,
            soilType: String? = nil,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.commonName = commonName
            self.wateringFrequency = wateringFrequency
            self.species = species
            self.family = family
            self.genus = genus
            self.sunExposure = sunExposure
            self.plantedAt = plantedAt
            self.soilType = soilType
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.commonName = try container.decodeIfPresent(String.self, forKey: .commonName)
            self.wateringFrequency = try container.decodeIfPresent(PlantBaseWateringFrequency.self, forKey: .wateringFrequency)
            self.species = try container.decode(String.self, forKey: .species)
            self.family = try container.decode(String.self, forKey: .family)
            self.genus = try container.decode(String.self, forKey: .genus)
            self.sunExposure = try container.decode(PlantPostSunExposure.self, forKey: .sunExposure)
            self.plantedAt = try container.decodeIfPresent(CalendarDate.self, forKey: .plantedAt)
            self.soilType = try container.decodeIfPresent(String.self, forKey: .soilType)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encodeIfPresent(self.commonName, forKey: .commonName)
            try container.encodeIfPresent(self.wateringFrequency, forKey: .wateringFrequency)
            try container.encode(self.species, forKey: .species)
            try container.encode(self.family, forKey: .family)
            try container.encode(self.genus, forKey: .genus)
            try container.encode(self.sunExposure, forKey: .sunExposure)
            try container.encodeIfPresent(self.plantedAt, forKey: .plantedAt)
            try container.encodeIfPresent(self.soilType, forKey: .soilType)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case commonName
            case wateringFrequency
            case species
            case family
            case genus
            case sunExposure
            case plantedAt
            case soilType
        }
    }
}