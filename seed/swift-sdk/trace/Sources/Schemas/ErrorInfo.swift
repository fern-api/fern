public enum ErrorInfo: Codable, Hashable, Sendable {
    case compileError(CompileError)
    case runtimeError(RuntimeError)
    case internalError(InternalError)

    public struct CompileError: Codable, Hashable, Sendable {
        public let type: String = "compileError"
        public let message: String
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
            try container.encode(self.message, forKey: .message)
        }

        enum CodingKeys: String, CodingKey, CaseIterable {
            case message
        }
    }

    public struct RuntimeError: Codable, Hashable, Sendable {
        public let type: String = "runtimeError"
        public let message: String
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
            try container.encode(self.message, forKey: .message)
        }

        enum CodingKeys: String, CodingKey, CaseIterable {
            case message
        }
    }

    public struct InternalError: Codable, Hashable, Sendable {
        public let type: String = "internalError"
        public let exceptionInfo: ExceptionInfo
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
            try container.encode(self.exceptionInfo, forKey: .exceptionInfo)
        }

        enum CodingKeys: String, CodingKey, CaseIterable {
            case exceptionInfo
        }
    }
}