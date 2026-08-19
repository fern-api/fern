import Foundation

public struct UsersListResponse: Codable, Hashable, Sendable {
    public let limit: Int?
    public let count: Int?
    public let hasMore: Bool?
    public let links: [Link]
    public let data: [String]
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        limit: Int? = nil,
        count: Int? = nil,
        hasMore: Bool? = nil,
        links: [Link],
        data: [String],
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.limit = limit
        self.count = count
        self.hasMore = hasMore
        self.links = links
        self.data = data
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.limit = try container.decodeIfPresent(Int.self, forKey: .limit)
        self.count = try container.decodeIfPresent(Int.self, forKey: .count)
        self.hasMore = try container.decodeIfPresent(Bool.self, forKey: .hasMore)
        self.links = try container.decode([Link].self, forKey: .links)
        self.data = try container.decode([String].self, forKey: .data)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encodeIfPresent(self.limit, forKey: .limit)
        try container.encodeIfPresent(self.count, forKey: .count)
        try container.encodeIfPresent(self.hasMore, forKey: .hasMore)
        try container.encode(self.links, forKey: .links)
        try container.encode(self.data, forKey: .data)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case limit
        case count
        case hasMore = "has_more"
        case links
        case data
    }
}