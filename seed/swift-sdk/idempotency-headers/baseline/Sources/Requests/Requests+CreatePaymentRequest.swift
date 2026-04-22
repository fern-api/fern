import Foundation

extension Requests {
    public struct CreatePaymentRequest: Codable, Hashable, Sendable {
        public let amount: Int
        public let currency: Currency
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            amount: Int,
            currency: Currency,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.amount = amount
            self.currency = currency
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.amount = try container.decode(Int.self, forKey: .amount)
            self.currency = try container.decode(Currency.self, forKey: .currency)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.amount, forKey: .amount)
            try container.encode(self.currency, forKey: .currency)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case amount
            case currency
        }
    }
}