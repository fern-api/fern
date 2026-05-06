import Foundation

public struct NestedUser: Codable, Hashable, Sendable {
    public let name: Nullable<String>?
    public let user: Nullable<User>?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        name: Nullable<String>? = nil,
        user: Nullable<User>? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.name = name
        self.user = user
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.name = try container.decodeNullableIfPresent(String.self, forKey: .name)
        self.user = try container.decodeNullableIfPresent(User.self, forKey: .user)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encodeNullableIfPresent(self.name, forKey: .name)
        try container.encodeNullableIfPresent(self.user, forKey: .user)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case name
        case user
    }
}