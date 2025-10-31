import Foundation

extension Requests {
    public struct UpdateFooRequest: Codable, Hashable, Sendable {
        /// Can be explicitly set to null to clear the value
        public let nullableText: Nullable<String>?
        /// Can be explicitly set to null to clear the value
        public let nullableNumber: Nullable<Double>?
        /// Regular non-nullable field
        public let nonNullableText: String?
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            nullableText: Nullable<String>? = nil,
            nullableNumber: Nullable<Double>? = nil,
            nonNullableText: String? = nil,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.nullableText = nullableText
            self.nullableNumber = nullableNumber
            self.nonNullableText = nonNullableText
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.nullableText = try container.decodeNullableIfPresent(String.self, forKey: .nullableText)
            self.nullableNumber = try container.decodeNullableIfPresent(Double.self, forKey: .nullableNumber)
            self.nonNullableText = try container.decodeIfPresent(String.self, forKey: .nonNullableText)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encodeNullableIfPresent(self.nullableText, forKey: .nullableText)
            try container.encodeNullableIfPresent(self.nullableNumber, forKey: .nullableNumber)
            try container.encodeIfPresent(self.nonNullableText, forKey: .nonNullableText)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case nullableText = "nullable_text"
            case nullableNumber = "nullable_number"
            case nonNullableText = "non_nullable_text"
        }
    }
}