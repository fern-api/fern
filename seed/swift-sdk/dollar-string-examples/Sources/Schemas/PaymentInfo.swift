import Foundation

public struct PaymentInfo: Codable, Hashable, Sendable {
    public let amount: String
    public let currency: String
    public let description: Nullable<String>?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        amount: String,
        currency: String,
        description: Nullable<String>? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.amount = amount
        self.currency = currency
        self.description = description
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.amount = try container.decode(String.self, forKey: .amount)
        self.currency = try container.decode(String.self, forKey: .currency)
        self.description = try container.decodeNullableIfPresent(String.self, forKey: .description)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.amount, forKey: .amount)
        try container.encode(self.currency, forKey: .currency)
        try container.encodeNullableIfPresent(self.description, forKey: .description)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case amount
        case currency
        case description
    }
}