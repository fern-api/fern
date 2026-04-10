import Foundation

public struct SearchResponse: Codable, Hashable, Sendable {
    public let results: [Resource]
    public let total: Nullable<Int>?
    public let nextOffset: Nullable<Int>?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        results: [Resource],
        total: Nullable<Int>? = nil,
        nextOffset: Nullable<Int>? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.results = results
        self.total = total
        self.nextOffset = nextOffset
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.results = try container.decode([Resource].self, forKey: .results)
        self.total = try container.decodeNullableIfPresent(Int.self, forKey: .total)
        self.nextOffset = try container.decodeNullableIfPresent(Int.self, forKey: .nextOffset)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.results, forKey: .results)
        try container.encodeNullableIfPresent(self.total, forKey: .total)
        try container.encodeNullableIfPresent(self.nextOffset, forKey: .nextOffset)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case results
        case total
        case nextOffset = "next_offset"
    }
}