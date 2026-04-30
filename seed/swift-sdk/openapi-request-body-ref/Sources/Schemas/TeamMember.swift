import Foundation

public struct TeamMember: Codable, Hashable, Sendable {
    public let id: String
    public let givenName: String?
    public let familyName: String?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        id: String,
        givenName: String? = nil,
        familyName: String? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.id = id
        self.givenName = givenName
        self.familyName = familyName
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.id = try container.decode(String.self, forKey: .id)
        self.givenName = try container.decodeIfPresent(String.self, forKey: .givenName)
        self.familyName = try container.decodeIfPresent(String.self, forKey: .familyName)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.id, forKey: .id)
        try container.encodeIfPresent(self.givenName, forKey: .givenName)
        try container.encodeIfPresent(self.familyName, forKey: .familyName)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case id
        case givenName = "given_name"
        case familyName = "family_name"
    }
}