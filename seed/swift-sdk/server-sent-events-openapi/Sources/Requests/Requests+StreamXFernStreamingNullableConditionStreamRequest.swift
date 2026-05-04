import Foundation

extension Requests {
    public struct StreamXFernStreamingNullableConditionStreamRequest: Codable, Hashable, Sendable {
        /// The prompt or query to complete.
        public let query: String
        /// Whether to stream the response. This field is nullable (OAS 3.1 type array), which previously caused the const literal to be overwritten by the nullable type during spread in the importer.
        public let stream: JSONValue
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            query: String,
            stream: JSONValue,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.query = query
            self.stream = stream
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.query = try container.decode(String.self, forKey: .query)
            self.stream = try container.decode(JSONValue.self, forKey: .stream)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.query, forKey: .query)
            try container.encode(self.stream, forKey: .stream)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case query
            case stream
        }
    }
}