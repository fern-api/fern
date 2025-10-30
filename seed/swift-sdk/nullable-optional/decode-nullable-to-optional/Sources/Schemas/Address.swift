import Foundation

/// Nested object for testing
public struct Address: Codable, Hashable, Sendable {
    public let street: String
    public let city: String?
    public let state: String?
    public let zipCode: String
    public let country: String?
    public let buildingId: NullableUserId
    public let tenantId: OptionalUserId
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        street: String,
        city: String? = nil,
        state: String? = nil,
        zipCode: String,
        country: String? = nil,
        buildingId: NullableUserId,
        tenantId: OptionalUserId,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.street = street
        self.city = city
        self.state = state
        self.zipCode = zipCode
        self.country = country
        self.buildingId = buildingId
        self.tenantId = tenantId
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.street = try container.decode(String.self, forKey: .street)
        self.city = try container.decodeIfPresent(String.self, forKey: .city)
        self.state = try container.decodeIfPresent(String.self, forKey: .state)
        self.zipCode = try container.decode(String.self, forKey: .zipCode)
        self.country = try container.decodeIfPresent(String.self, forKey: .country)
        self.buildingId = try container.decode(NullableUserId.self, forKey: .buildingId)
        self.tenantId = try container.decode(OptionalUserId.self, forKey: .tenantId)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.street, forKey: .street)
        try container.encodeIfPresent(self.city, forKey: .city)
        try container.encodeIfPresent(self.state, forKey: .state)
        try container.encode(self.zipCode, forKey: .zipCode)
        try container.encodeIfPresent(self.country, forKey: .country)
        try container.encode(self.buildingId, forKey: .buildingId)
        try container.encode(self.tenantId, forKey: .tenantId)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case street
        case city
        case state
        case zipCode
        case country
        case buildingId
        case tenantId
    }
}