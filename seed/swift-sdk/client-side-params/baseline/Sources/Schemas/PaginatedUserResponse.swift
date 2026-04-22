import Foundation

/// Response with pagination info like Auth0
public struct PaginatedUserResponse: Codable, Hashable, Sendable {
    public let users: [User]
    public let start: Int
    public let limit: Int
    public let length: Int
    public let total: Int?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        users: [User],
        start: Int,
        limit: Int,
        length: Int,
        total: Int? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.users = users
        self.start = start
        self.limit = limit
        self.length = length
        self.total = total
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.users = try container.decode([User].self, forKey: .users)
        self.start = try container.decode(Int.self, forKey: .start)
        self.limit = try container.decode(Int.self, forKey: .limit)
        self.length = try container.decode(Int.self, forKey: .length)
        self.total = try container.decodeIfPresent(Int.self, forKey: .total)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.users, forKey: .users)
        try container.encode(self.start, forKey: .start)
        try container.encode(self.limit, forKey: .limit)
        try container.encode(self.length, forKey: .length)
        try container.encodeIfPresent(self.total, forKey: .total)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case users
        case start
        case limit
        case length
        case total
    }
}