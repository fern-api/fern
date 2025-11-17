import Foundation

extension Requests {
    public struct PaymentRequest: Codable, Hashable, Sendable {
        public let paymentMethod: PaymentMethodUnion
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            paymentMethod: PaymentMethodUnion,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.paymentMethod = paymentMethod
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.paymentMethod = try container.decode(PaymentMethodUnion.self, forKey: .paymentMethod)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.paymentMethod, forKey: .paymentMethod)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case paymentMethod
        }
    }
}