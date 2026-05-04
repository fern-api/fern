import Foundation

public struct PagingCursors: Codable, Hashable, Sendable {
    /// Cursor for the next page of results.
    public let next: String
    /// Cursor for the previous page of results.
    public let previous: String?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        next: String,
        previous: String? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.next = next
        self.previous = previous
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.next = try container.decode(String.self, forKey: .next)
        self.previous = try container.decodeIfPresent(String.self, forKey: .previous)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.next, forKey: .next)
        try container.encodeIfPresent(self.previous, forKey: .previous)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case next
        case previous
    }
}