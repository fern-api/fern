import Foundation

extension Requests {
    public struct StreamXFernStreamingSharedSchemaRequest: Codable, Hashable, Sendable {
        /// The prompt to complete.
        public let prompt: String
        /// The model to use.
        public let model: String
        /// Whether to stream the response.
        public let stream: JSONValue
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            prompt: String,
            model: String,
            stream: JSONValue,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.prompt = prompt
            self.model = model
            self.stream = stream
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.prompt = try container.decode(String.self, forKey: .prompt)
            self.model = try container.decode(String.self, forKey: .model)
            self.stream = try container.decode(JSONValue.self, forKey: .stream)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.prompt, forKey: .prompt)
            try container.encode(self.model, forKey: .model)
            try container.encode(self.stream, forKey: .stream)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case prompt
            case model
            case stream
        }
    }
}