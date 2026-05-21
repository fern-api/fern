import Foundation

public struct UserV2Profile: Codable, Hashable, Sendable {
    public let email: String?
    public let displayName: String?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        email: String? = nil,
        displayName: String? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.email = email
        self.displayName = displayName
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.email = try container.decodeIfPresent(String.self, forKey: .email)
        self.displayName = try container.decodeIfPresent(String.self, forKey: .displayName)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encodeIfPresent(self.email, forKey: .email)
        try container.encodeIfPresent(self.displayName, forKey: .displayName)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case email
        case displayName
    }
}