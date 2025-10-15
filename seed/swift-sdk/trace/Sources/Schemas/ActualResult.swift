import Foundation

public enum ActualResult: Codable, Hashable, Sendable {
    case exception(Exception)
    case exceptionV2(ExceptionV2)
    case value(Value)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "value":
            self = .value(try Value(from: decoder))
        case "exception":
            self = .exception(try Exception(from: decoder))
        case "exceptionV2":
            self = .exceptionV2(try ExceptionV2(from: decoder))
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
        case .value(let data):
            try data.encode(to: encoder)
        case .exception(let data):
            try data.encode(to: encoder)
        case .exceptionV2(let data):
            try data.encode(to: encoder)
        }
    }

    public struct Value: Codable, Hashable, Sendable {
        public let type: String = "value"
        public let value: VariableValue
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            value: VariableValue,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.value = value
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.value = try container.decode(VariableValue.self, forKey: .value)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.value, forKey: .value)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case value
        }
    }

    public struct Exception: Codable, Hashable, Sendable {
        public let type: String = "exception"
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

    public struct ExceptionV2: Codable, Hashable, Sendable {
        public let type: String = "exceptionV2"
        public let value: Trace.ExceptionV2
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            value: Trace.ExceptionV2,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.value = value
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.value = try container.decode(Trace.ExceptionV2.self, forKey: .value)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.value, forKey: .value)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case value
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
    }
}