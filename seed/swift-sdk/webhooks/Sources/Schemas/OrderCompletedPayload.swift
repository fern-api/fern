import Foundation

public struct OrderCompletedPayload: Codable, Hashable, Sendable {
    public let orderId: String
    public let total: Double
    public let currency: String
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        orderId: String,
        total: Double,
        currency: String,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.orderId = orderId
        self.total = total
        self.currency = currency
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.orderId = try container.decode(String.self, forKey: .orderId)
        self.total = try container.decode(Double.self, forKey: .total)
        self.currency = try container.decode(String.self, forKey: .currency)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.orderId, forKey: .orderId)
        try container.encode(self.total, forKey: .total)
        try container.encode(self.currency, forKey: .currency)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case orderId
        case total
        case currency
    }
}