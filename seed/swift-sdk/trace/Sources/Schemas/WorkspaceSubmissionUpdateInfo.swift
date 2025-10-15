import Foundation

public enum WorkspaceSubmissionUpdateInfo: Codable, Hashable, Sendable {
    case errored(Errored)
    case finished(Finished)
    case ran(Ran)
    case running(Running)
    case stopped(Stopped)
    case traced(Traced)
    case tracedV2(TracedV2)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "running":
            self = .running(try Running(from: decoder))
        case "ran":
            self = .ran(try Ran(from: decoder))
        case "stopped":
            self = .stopped(try Stopped(from: decoder))
        case "traced":
            self = .traced(try Traced(from: decoder))
        case "tracedV2":
            self = .tracedV2(try TracedV2(from: decoder))
        case "errored":
            self = .errored(try Errored(from: decoder))
        case "finished":
            self = .finished(try Finished(from: decoder))
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
        case .running(let data):
            try data.encode(to: encoder)
        case .ran(let data):
            try data.encode(to: encoder)
        case .stopped(let data):
            try data.encode(to: encoder)
        case .traced(let data):
            try data.encode(to: encoder)
        case .tracedV2(let data):
            try data.encode(to: encoder)
        case .errored(let data):
            try data.encode(to: encoder)
        case .finished(let data):
            try data.encode(to: encoder)
        }
    }

    public struct Running: Codable, Hashable, Sendable {
        public let type: String = "running"
        public let value: RunningSubmissionState
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            value: RunningSubmissionState,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.value = value
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.value = try container.decode(RunningSubmissionState.self, forKey: .value)
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

    public struct Ran: Codable, Hashable, Sendable {
        public let type: String = "ran"
        public let exceptionV2: ExceptionV2?
        public let exception: ExceptionInfo?
        public let stdout: String
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            exceptionV2: ExceptionV2? = nil,
            exception: ExceptionInfo? = nil,
            stdout: String,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.exceptionV2 = exceptionV2
            self.exception = exception
            self.stdout = stdout
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.exceptionV2 = try container.decodeIfPresent(ExceptionV2.self, forKey: .exceptionV2)
            self.exception = try container.decodeIfPresent(ExceptionInfo.self, forKey: .exception)
            self.stdout = try container.decode(String.self, forKey: .stdout)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encodeIfPresent(self.exceptionV2, forKey: .exceptionV2)
            try container.encodeIfPresent(self.exception, forKey: .exception)
            try container.encode(self.stdout, forKey: .stdout)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case exceptionV2
            case exception
            case stdout
        }
    }

    public struct Stopped: Codable, Hashable, Sendable {
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

    public struct Traced: Codable, Hashable, Sendable {
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

    public struct TracedV2: Codable, Hashable, Sendable {
        public let type: String = "tracedV2"
        public let traceResponsesSize: Int
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            traceResponsesSize: Int,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.traceResponsesSize = traceResponsesSize
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.traceResponsesSize = try container.decode(Int.self, forKey: .traceResponsesSize)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.traceResponsesSize, forKey: .traceResponsesSize)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case traceResponsesSize
        }
    }

    public struct Errored: Codable, Hashable, Sendable {
        public let type: String = "errored"
        public let value: ErrorInfo
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            value: ErrorInfo,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.value = value
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.value = try container.decode(ErrorInfo.self, forKey: .value)
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

    public struct Finished: Codable, Hashable, Sendable {
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