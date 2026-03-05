import Foundation

/// Base order schema with common order fields.
public struct OrderBase: Codable, Hashable, Sendable {
    /// Unique identifier for the order.
    public let orderId: String
    /// Total amount for the order.
    public let amount: Double
    /// Currency code (e.g. USD, EUR).
    public let currency: String
    /// Timestamp when the order was placed.
    public let dateTime: Date?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        orderId: String,
        amount: Double,
        currency: String,
        dateTime: Date? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.orderId = orderId
        self.amount = amount
        self.currency = currency
        self.dateTime = dateTime
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.orderId = try container.decode(String.self, forKey: .orderId)
        self.amount = try container.decode(Double.self, forKey: .amount)
        self.currency = try container.decode(String.self, forKey: .currency)
        self.dateTime = try container.decodeIfPresent(Date.self, forKey: .dateTime)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.orderId, forKey: .orderId)
        try container.encode(self.amount, forKey: .amount)
        try container.encode(self.currency, forKey: .currency)
        try container.encodeIfPresent(self.dateTime, forKey: .dateTime)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case orderId
        case amount
        case currency
        case dateTime
    }
}