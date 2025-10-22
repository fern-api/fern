import Foundation

public enum ErrorInfo: Codable, Hashable, Sendable {
    case compileError(CompileError)
    /// If the trace backend encounters an unexpected error.
    case internalError(InternalError)
    /// If the submission cannot be executed and throws a runtime error before getting to any of the testcases.
    case runtimeError(RuntimeError)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "compileError":
            self = .compileError(try CompileError(from: decoder))
        case "internalError":
            self = .internalError(try InternalError(from: decoder))
        case "runtimeError":
            self = .runtimeError(try RuntimeError(from: decoder))
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
        case .compileError(let data):
            try data.encode(to: encoder)
        case .internalError(let data):
            try data.encode(to: encoder)
        case .runtimeError(let data):
            try data.encode(to: encoder)
        }
    }

    public struct CompileError: Codable, Hashable, Sendable {
        public let type: String = "compileError"
        public let message: String
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            message: String,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.message = message
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.message = try container.decode(String.self, forKey: .message)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.message, forKey: .message)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case message
        }
    }

    /// If the submission cannot be executed and throws a runtime error before getting to any of the testcases.
    public struct RuntimeError: Codable, Hashable, Sendable {
        public let type: String = "runtimeError"
        public let message: String
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            message: String,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.message = message
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.message = try container.decode(String.self, forKey: .message)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.message, forKey: .message)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case message
        }
    }

    /// If the trace backend encounters an unexpected error.
    public struct InternalError: Codable, Hashable, Sendable {
        public let type: String = "internalError"
        public let exceptionInfo: ExceptionInfo
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            exceptionInfo: ExceptionInfo,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.exceptionInfo = exceptionInfo
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.exceptionInfo = try container.decode(ExceptionInfo.self, forKey: .exceptionInfo)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.exceptionInfo, forKey: .exceptionInfo)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case exceptionInfo
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
    }
}