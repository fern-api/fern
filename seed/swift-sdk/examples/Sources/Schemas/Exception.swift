import Foundation

public enum Exception: Codable, Hashable, Sendable {
    case generic(Generic)
    case timeout(Timeout)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "generic":
            self = .generic(try Generic(from: decoder))
        case "timeout":
            self = .timeout(try Timeout(from: decoder))
        default:
            throw DecodingError.dataCorrupted(
                DecodingError.Context(
                    codingPath: decoder.codingPath,
                    debugDescription: "Unknown shape discriminant value: \(discriminant)"
                )
            )
        }
    }

    public func encode(to encoder: Encoder) throws -> Void {
        switch self {
        case .generic(let data):
            try data.encode(to: encoder)
        case .timeout(let data):
            try data.encode(to: encoder)
        }
    }

    public struct Generic: Codable, Hashable, Sendable {
        public let type: String = "generic"
        public let exceptionType: String
        public let exceptionMessage: String
        public let exceptionStacktrace: String
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            exceptionType: String,
            exceptionMessage: String,
            exceptionStacktrace: String,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.exceptionType = exceptionType
            self.exceptionMessage = exceptionMessage
            self.exceptionStacktrace = exceptionStacktrace
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.exceptionType = try container.decode(String.self, forKey: .exceptionType)
            self.exceptionMessage = try container.decode(String.self, forKey: .exceptionMessage)
            self.exceptionStacktrace = try container.decode(String.self, forKey: .exceptionStacktrace)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.exceptionType, forKey: .exceptionType)
            try container.encode(self.exceptionMessage, forKey: .exceptionMessage)
            try container.encode(self.exceptionStacktrace, forKey: .exceptionStacktrace)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case exceptionType
            case exceptionMessage
            case exceptionStacktrace
        }
    }

    public struct Timeout: Codable, Hashable, Sendable {
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            self.additionalProperties = try decoder.decodeAdditionalProperties(knownKeys: [])
        }

        public func encode(to encoder: Encoder) throws -> Void {
            try encoder.encodeAdditionalProperties(self.additionalProperties)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
    }
}