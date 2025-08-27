import Foundation

/// Nested object for testing
public struct Address: Codable, Hashable, Sendable {
    public let street: String
    public let city: JSONValue
    public let state: String?
    public let zipCode: String
    public let country: JSONValue?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        street: String,
        city: JSONValue,
        state: String? = nil,
        zipCode: String,
        country: JSONValue? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.street = street
        self.city = city
        self.state = state
        self.zipCode = zipCode
        self.country = country
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.street = try container.decode(String.self, forKey: .street)
        self.city = try container.decode(JSONValue.self, forKey: .city)
        self.state = try container.decodeIfPresent(String.self, forKey: .state)
        self.zipCode = try container.decode(String.self, forKey: .zipCode)
        self.country = try container.decodeIfPresent(JSONValue.self, forKey: .country)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.street, forKey: .street)
        try container.encode(self.city, forKey: .city)
        try container.encodeIfPresent(self.state, forKey: .state)
        try container.encode(self.zipCode, forKey: .zipCode)
        try container.encodeIfPresent(self.country, forKey: .country)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case street
        case city
        case state
        case zipCode
        case country
    }
}