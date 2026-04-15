import Foundation

public struct RuleTypeSearchResponse: Codable, Hashable, Sendable {
    /// Current page of results from the requested resource.
    public let results: [RuleType]?
    public let paging: PagingCursors
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        results: [RuleType]? = nil,
        paging: PagingCursors,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.results = results
        self.paging = paging
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.results = try container.decodeIfPresent([RuleType].self, forKey: .results)
        self.paging = try container.decode(PagingCursors.self, forKey: .paging)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encodeIfPresent(self.results, forKey: .results)
        try container.encode(self.paging, forKey: .paging)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case results
        case paging
    }
}