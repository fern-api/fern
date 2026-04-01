import Foundation

extension Requests {
    public struct PostWithBooleanLiteralRequest: Codable, Hashable, Sendable {
        public let stream: JSONValue
        public let query: String
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            stream: JSONValue,
            query: String,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.stream = stream
            self.query = query
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.stream = try container.decode(JSONValue.self, forKey: .stream)
            self.query = try container.decode(String.self, forKey: .query)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.stream, forKey: .stream)
            try container.encode(self.query, forKey: .query)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case stream
            case query
        }
    }
}