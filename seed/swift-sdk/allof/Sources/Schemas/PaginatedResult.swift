import Foundation

public struct PaginatedResult: Codable, Hashable, Sendable {
    public let paging: PagingCursors
    /// Current page of results from the requested resource.
    public let results: [JSONValue]
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        paging: PagingCursors,
        results: [JSONValue],
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.paging = paging
        self.results = results
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.paging = try container.decode(PagingCursors.self, forKey: .paging)
        self.results = try container.decode([JSONValue].self, forKey: .results)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.paging, forKey: .paging)
        try container.encode(self.results, forKey: .results)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case paging
        case results
    }
}