import Foundation

public struct PaymentNotificationPayload: Codable, Hashable, Sendable {
    public let paymentId: String
    public let amount: Double
    public let status: String
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        paymentId: String,
        amount: Double,
        status: String,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.paymentId = paymentId
        self.amount = amount
        self.status = status
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.paymentId = try container.decode(String.self, forKey: .paymentId)
        self.amount = try container.decode(Double.self, forKey: .amount)
        self.status = try container.decode(String.self, forKey: .status)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.paymentId, forKey: .paymentId)
        try container.encode(self.amount, forKey: .amount)
        try container.encode(self.status, forKey: .status)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case paymentId
        case amount
        case status
    }
}