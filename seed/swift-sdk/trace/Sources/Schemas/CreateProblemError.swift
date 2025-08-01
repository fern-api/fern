public enum CreateProblemError: Codable, Hashable, Sendable {
    case generic(Generic)

    public struct Generic: Codable, Hashable, Sendable {
        public let errorType: String = "generic"
        public let message: String
        public let type: String
        public let stacktrace: String
        public let additionalProperties: [String: JSONValue]
        public let _additionalProperties: [String: JSONValue]

        public init(
            message: String,
            type: String,
            stacktrace: String,
            additionalProperties: [String: JSONValue],
            _additionalProperties: [String: JSONValue] = .init()
        ) {
            self.message = message
            self.type = type
            self.stacktrace = stacktrace
            self.additionalProperties = additionalProperties
            self._additionalProperties = _additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.message = try container.decode(String.self, forKey: .message)
            self.type = try container.decode(String.self, forKey: .type)
            self.stacktrace = try container.decode(String.self, forKey: .stacktrace)
            self.additionalProperties = try container.decode([String: JSONValue].self, forKey: .additionalProperties)
            self._additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self._additionalProperties)
            try container.encode(self.message, forKey: .message)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.stacktrace, forKey: .stacktrace)
            try container.encode(self.additionalProperties, forKey: .additionalProperties)
        }

        enum CodingKeys: String, CodingKey, CaseIterable {
            case message = "placeholder"
            case type = "placeholder"
            case stacktrace = "placeholder"
            case additionalProperties = "placeholder"
        }
    }
}