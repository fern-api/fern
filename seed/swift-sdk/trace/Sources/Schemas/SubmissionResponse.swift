public enum SubmissionResponse: Codable, Hashable, Sendable {
    case serverInitialized(ServerInitialized)
    case problemInitialized(ProblemInitialized)
    case workspaceInitialized(WorkspaceInitialized)
    case serverErrored(ServerErrored)
    case codeExecutionUpdate(CodeExecutionUpdate)
    case terminated(Terminated)

    public struct ServerInitialized: Codable, Hashable, Sendable {
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
            try container.encode(self.value, forKey: .value)
        }

        enum CodingKeys: String, CodingKey, CaseIterable {
            case value
        }
    }

    public struct WorkspaceInitialized: Codable, Hashable, Sendable {
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
        public let additionalProperties: [String: JSONValue]
        public let _additionalProperties: [String: JSONValue]

        public init(
            exceptionType: String,
            exceptionMessage: String,
            exceptionStacktrace: String,
            additionalProperties: [String: JSONValue],
            _additionalProperties: [String: JSONValue] = .init()
        ) {
            self.exceptionType = exceptionType
            self.exceptionMessage = exceptionMessage
            self.exceptionStacktrace = exceptionStacktrace
            self.additionalProperties = additionalProperties
            self._additionalProperties = _additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.exceptionType = try container.decode(String.self, forKey: .exceptionType)
            self.exceptionMessage = try container.decode(String.self, forKey: .exceptionMessage)
            self.exceptionStacktrace = try container.decode(String.self, forKey: .exceptionStacktrace)
            self.additionalProperties = try container.decode([String: JSONValue].self, forKey: .additionalProperties)
            self._additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self._additionalProperties)
            try container.encode(self.exceptionType, forKey: .exceptionType)
            try container.encode(self.exceptionMessage, forKey: .exceptionMessage)
            try container.encode(self.exceptionStacktrace, forKey: .exceptionStacktrace)
            try container.encode(self.additionalProperties, forKey: .additionalProperties)
        }

        enum CodingKeys: String, CodingKey, CaseIterable {
            case exceptionType = "placeholder"
            case exceptionMessage = "placeholder"
            case exceptionStacktrace = "placeholder"
            case additionalProperties = "placeholder"
        }
    }

    public struct CodeExecutionUpdate: Codable, Hashable, Sendable {
        public let type: String = "codeExecutionUpdate"
        public let value: CodeExecutionUpdate
        public let additionalProperties: [String: JSONValue]

        public init(
            value: CodeExecutionUpdate,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.value = value
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.value = try container.decode(CodeExecutionUpdate.self, forKey: .value)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.value, forKey: .value)
        }

        enum CodingKeys: String, CodingKey, CaseIterable {
            case value
        }
    }

    public struct Terminated: Codable, Hashable, Sendable {
        public let type: String = "terminated"
        public let additionalProperties: [String: JSONValue]
        public let _additionalProperties: [String: JSONValue]

        public init(
            additionalProperties: [String: JSONValue],
            _additionalProperties: [String: JSONValue] = .init()
        ) {
            self.additionalProperties = additionalProperties
            self._additionalProperties = _additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.additionalProperties = try container.decode([String: JSONValue].self, forKey: .additionalProperties)
            self._additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self._additionalProperties)
            try container.encode(self.additionalProperties, forKey: .additionalProperties)
        }

        enum CodingKeys: String, CodingKey, CaseIterable {
            case additionalProperties = "placeholder"
        }
    }
}