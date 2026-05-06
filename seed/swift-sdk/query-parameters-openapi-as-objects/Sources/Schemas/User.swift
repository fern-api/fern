import Foundation

public struct User: Codable, Hashable, Sendable {
    public let name: Nullable<String>?
    public let tags: Nullable<[String]>?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        name: Nullable<String>? = nil,
        tags: Nullable<[String]>? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.name = name
        self.tags = tags
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.name = try container.decodeNullableIfPresent(String.self, forKey: .name)
        self.tags = try container.decodeNullableIfPresent([String].self, forKey: .tags)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encodeNullableIfPresent(self.name, forKey: .name)
        try container.encodeNullableIfPresent(self.tags, forKey: .tags)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case name
        case tags
    }
}