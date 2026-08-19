import Foundation

/// Paginated response for clients listing
public struct PaginatedClientResponse: Codable, Hashable, Sendable {
    /// Starting index (zero-based)
    public let start: Int
    /// Number of items requested
    public let limit: Int
    /// Number of items returned
    public let length: Int
    /// Total number of items (when include_totals=true)
    public let total: Int?
    /// List of clients
    public let clients: [Client]
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        start: Int,
        limit: Int,
        length: Int,
        total: Int? = nil,
        clients: [Client],
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.start = start
        self.limit = limit
        self.length = length
        self.total = total
        self.clients = clients
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.start = try container.decode(Int.self, forKey: .start)
        self.limit = try container.decode(Int.self, forKey: .limit)
        self.length = try container.decode(Int.self, forKey: .length)
        self.total = try container.decodeIfPresent(Int.self, forKey: .total)
        self.clients = try container.decode([Client].self, forKey: .clients)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.start, forKey: .start)
        try container.encode(self.limit, forKey: .limit)
        try container.encode(self.length, forKey: .length)
        try container.encodeIfPresent(self.total, forKey: .total)
        try container.encode(self.clients, forKey: .clients)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case start
        case limit
        case length
        case total
        case clients
    }
}