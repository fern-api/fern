import Foundation

public struct DocumentMetadata: Codable, Hashable, Sendable {
    public let author: Nullable<String>?
    public let id: Nullable<Int>?
    public let tags: Nullable<[JSONValue]>?
    public let title: Nullable<String>?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        author: Nullable<String>? = nil,
        id: Nullable<Int>? = nil,
        tags: Nullable<[JSONValue]>? = nil,
        title: Nullable<String>? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.author = author
        self.id = id
        self.tags = tags
        self.title = title
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.author = try container.decodeNullableIfPresent(String.self, forKey: .author)
        self.id = try container.decodeNullableIfPresent(Int.self, forKey: .id)
        self.tags = try container.decodeNullableIfPresent([JSONValue].self, forKey: .tags)
        self.title = try container.decodeNullableIfPresent(String.self, forKey: .title)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encodeNullableIfPresent(self.author, forKey: .author)
        try container.encodeNullableIfPresent(self.id, forKey: .id)
        try container.encodeNullableIfPresent(self.tags, forKey: .tags)
        try container.encodeNullableIfPresent(self.title, forKey: .title)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case author
        case id
        case tags
        case title
    }
}