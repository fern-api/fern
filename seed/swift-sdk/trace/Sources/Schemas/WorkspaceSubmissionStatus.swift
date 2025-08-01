public enum WorkspaceSubmissionStatus: Codable, Hashable, Sendable {
    case stopped(Stopped)
    case errored(Errored)
    case running(Running)
    case ran(Ran)
    case traced(Traced)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "stopped":
            self = .stopped(try Stopped(from: decoder))
        case "errored":
            self = .errored(try Errored(from: decoder))
        case "running":
            self = .running(try Running(from: decoder))
        case "ran":
            self = .ran(try Ran(from: decoder))
        case "traced":
            self = .traced(try Traced(from: decoder))
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
        case .stopped(let data):
            try data.encode(to: encoder)
        case .errored(let data):
            try data.encode(to: encoder)
        case .running(let data):
            try data.encode(to: encoder)
        case .ran(let data):
            try data.encode(to: encoder)
        case .traced(let data):
            try data.encode(to: encoder)
        }
    }

    public struct Stopped: Codable, Hashable, Sendable {
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

    public struct Errored: Codable, Hashable, Sendable {
        public let type: String = "errored"
        public let value: ErrorInfo
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

        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case value
        }
    }

    public struct Running: Codable, Hashable, Sendable {
        public let type: String = "running"
        public let value: RunningSubmissionState
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

        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case exceptionV2
            case exception
            case stdout
        }
    }

    public struct Traced: Codable, Hashable, Sendable {
        public let type: String = "traced"
        public let exceptionV2: ExceptionV2?
        public let exception: ExceptionInfo?
        public let stdout: String
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

        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case exceptionV2
            case exception
            case stdout
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
    }
}