import Foundation

public struct Invoice: Codable, Hashable, Sendable {
    public let id: String
    public let amountCents: Int64
    public let currency: String?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        id: String,
        amountCents: Int64,
        currency: String? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.id = id
        self.amountCents = amountCents
        self.currency = currency
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.id = try container.decode(String.self, forKey: .id)
        self.amountCents = try container.decode(Int64.self, forKey: .amountCents)
        self.currency = try container.decodeIfPresent(String.self, forKey: .currency)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.id, forKey: .id)
        try container.encode(self.amountCents, forKey: .amountCents)
        try container.encodeIfPresent(self.currency, forKey: .currency)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case id
        case amountCents
        case currency
    }
}