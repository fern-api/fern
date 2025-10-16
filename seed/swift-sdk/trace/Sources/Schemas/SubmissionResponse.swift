import Foundation

public enum SubmissionResponse: Codable, Hashable, Sendable {
    case codeExecutionUpdate(CodeExecutionUpdate)
    case problemInitialized(ProblemInitialized)
    case serverErrored(ServerErrored)
    case serverInitialized(ServerInitialized)
    case terminated(Terminated)
    case workspaceInitialized(WorkspaceInitialized)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "serverInitialized":
            self = .serverInitialized(try ServerInitialized(from: decoder))
        case "problemInitialized":
            self = .problemInitialized(try ProblemInitialized(from: decoder))
        case "workspaceInitialized":
            self = .workspaceInitialized(try WorkspaceInitialized(from: decoder))
        case "serverErrored":
            self = .serverErrored(try ServerErrored(from: decoder))
        case "codeExecutionUpdate":
            self = .codeExecutionUpdate(try CodeExecutionUpdate(from: decoder))
        case "terminated":
            self = .terminated(try Terminated(from: decoder))
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
        case .serverInitialized(let data):
            try data.encode(to: encoder)
        case .problemInitialized(let data):
            try data.encode(to: encoder)
        case .workspaceInitialized(let data):
            try data.encode(to: encoder)
        case .serverErrored(let data):
            try data.encode(to: encoder)
        case .codeExecutionUpdate(let data):
            try data.encode(to: encoder)
        case .terminated(let data):
            try data.encode(to: encoder)
        }
    }

    public struct ServerInitialized: Codable, Hashable, Sendable {
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

    public struct ProblemInitialized: Codable, Hashable, Sendable {
        public let type: String = "problemInitialized"
        public let value: ProblemId
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            value: ProblemId,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.value = value
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.value = try container.decode(ProblemId.self, forKey: .value)
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

    public struct WorkspaceInitialized: Codable, Hashable, Sendable {
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

    public struct ServerErrored: Codable, Hashable, Sendable {
        public let type: String = "serverErrored"
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

    public struct CodeExecutionUpdate: Codable, Hashable, Sendable {
        public let type: String = "codeExecutionUpdate"
        public let value: Trace.CodeExecutionUpdate
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            value: Trace.CodeExecutionUpdate,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.value = value
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.value = try container.decode(Trace.CodeExecutionUpdate.self, forKey: .value)
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

    public struct Terminated: Codable, Hashable, Sendable {
        public let type: String = "terminated"
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
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
    }
}