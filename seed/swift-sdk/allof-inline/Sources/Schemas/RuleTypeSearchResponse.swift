import Foundation

public struct RuleTypeSearchResponse: Codable, Hashable, Sendable {
    public let paging: PagingCursors
    /// Current page of results from the requested resource.
    public let results: [RuleType]?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        paging: PagingCursors,
        results: [RuleType]? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.paging = paging
        self.results = results
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.paging = try container.decode(PagingCursors.self, forKey: .paging)
        self.results = try container.decodeIfPresent([RuleType].self, forKey: .results)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.paging, forKey: .paging)
        try container.encodeIfPresent(self.results, forKey: .results)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case paging
        case results
    }
}