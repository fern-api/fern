import Foundation

public struct Document: Codable, Hashable, Sendable {
    public let id: String
    public let title: String
    public let content: String
    public let author: String?
    public let tags: [String]?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        id: String,
        title: String,
        content: String,
        author: String? = nil,
        tags: [String]? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.id = id
        self.title = title
        self.content = content
        self.author = author
        self.tags = tags
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.id = try container.decode(String.self, forKey: .id)
        self.title = try container.decode(String.self, forKey: .title)
        self.content = try container.decode(String.self, forKey: .content)
        self.author = try container.decodeIfPresent(String.self, forKey: .author)
        self.tags = try container.decodeIfPresent([String].self, forKey: .tags)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.id, forKey: .id)
        try container.encode(self.title, forKey: .title)
        try container.encode(self.content, forKey: .content)
        try container.encodeIfPresent(self.author, forKey: .author)
        try container.encodeIfPresent(self.tags, forKey: .tags)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case id
        case title
        case content
        case author
        case tags
    }
}