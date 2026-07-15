import Foundation

public struct SearchProductsRequestConfig: Codable, Hashable, Sendable {
    public let currency: String?
    public let limit: Int?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        currency: String? = nil,
        limit: Int? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.currency = currency
        self.limit = limit
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.currency = try container.decodeIfPresent(String.self, forKey: .currency)
        self.limit = try container.decodeIfPresent(Int.self, forKey: .limit)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encodeIfPresent(self.currency, forKey: .currency)
        try container.encodeIfPresent(self.limit, forKey: .limit)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case currency
        case limit
    }
}