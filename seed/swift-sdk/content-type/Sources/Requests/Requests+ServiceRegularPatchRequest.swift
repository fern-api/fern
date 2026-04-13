import Foundation

extension Requests {
    public struct ServiceRegularPatchRequest: Codable, Hashable, Sendable {
        public let field1: Nullable<String>?
        public let field2: Nullable<Int>?
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            field1: Nullable<String>? = nil,
            field2: Nullable<Int>? = nil,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.field1 = field1
            self.field2 = field2
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.field1 = try container.decodeNullableIfPresent(String.self, forKey: .field1)
            self.field2 = try container.decodeNullableIfPresent(Int.self, forKey: .field2)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encodeNullableIfPresent(self.field1, forKey: .field1)
            try container.encodeNullableIfPresent(self.field2, forKey: .field2)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case field1
            case field2
        }
    }
}