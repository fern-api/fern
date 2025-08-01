public enum CreateProblemError: Codable, Hashable, Sendable {
    case generic(Generic)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .errorType)
        switch discriminant {
        case "generic":
            self = .generic(try Generic(from: decoder))
        default:
            throw DecodingError.dataCorrupted(
                DecodingError.Context(
                    codingPath: decoder.codingPath,
                    debugDescription: "Unknown shape discriminant value: \(discriminant)"
                )
            )
        }}

    public func encode(to encoder: Encoder) throws -> Void {
    }

    public struct Generic: Codable, Hashable, Sendable {
        public let errorType: String = "generic"
        public let message: String
        public let type: String
        public let stacktrace: String
        public let additionalProperties: [String: JSONValue]

        public init(
            message: String,
            type: String,
            stacktrace: String,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.message = message
            self.type = type
            self.stacktrace = stacktrace
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.message = try container.decode(String.self, forKey: .message)
            self.type = try container.decode(String.self, forKey: .type)
            self.stacktrace = try container.decode(String.self, forKey: .stacktrace)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.message, forKey: .message)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.stacktrace, forKey: .stacktrace)
        }

        enum CodingKeys: String, CodingKey, CaseIterable {
            case errorType = "_type"
            case message
            case type
            case stacktrace
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case errorType = "_type"
    }
}