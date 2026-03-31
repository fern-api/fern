import Foundation

public struct RefundProcessedPayload: Codable, Hashable, Sendable {
    public let refundId: String
    public let amount: Double
    public let reason: String?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        refundId: String,
        amount: Double,
        reason: String? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.refundId = refundId
        self.amount = amount
        self.reason = reason
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.refundId = try container.decode(String.self, forKey: .refundId)
        self.amount = try container.decode(Double.self, forKey: .amount)
        self.reason = try container.decodeIfPresent(String.self, forKey: .reason)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.refundId, forKey: .refundId)
        try container.encode(self.amount, forKey: .amount)
        try container.encodeIfPresent(self.reason, forKey: .reason)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case refundId
        case amount
        case reason
    }
}