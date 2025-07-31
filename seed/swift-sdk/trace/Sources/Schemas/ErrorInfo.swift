public enum ErrorInfo: Codable, Hashable, Sendable {
    case compileError(CompileError)
    case runtimeError(RuntimeError)
    case internalError(InternalError)

    public struct CompileError: Codable, Hashable, Sendable {
        public let type: String = "compileError"
        public let message: String
        public let additionalProperties: [String: JSONValue]

        public init(type: String, message: String, additionalProperties: [String: JSONValue]) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct RuntimeError: Codable, Hashable, Sendable {
        public let type: String = "runtimeError"
        public let message: String
        public let additionalProperties: [String: JSONValue]

        public init(type: String, message: String, additionalProperties: [String: JSONValue]) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct InternalError: Codable, Hashable, Sendable {
        public let type: String = "internalError"
        public let exceptionInfo: ExceptionInfo
        public let additionalProperties: [String: JSONValue]

        public init(type: String, exceptionInfo: ExceptionInfo, additionalProperties: [String: JSONValue]) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }
}