public enum ActualResult: Codable, Hashable, Sendable {
    case value(Value)
    case exception(Exception)
    case exceptionV2(ExceptionV2)

    public struct Value: Codable, Hashable, Sendable {
        public let value: VariableValue

        public init(value: VariableValue) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct Exception: Codable, Hashable, Sendable {
        public let type: String = "exception"
        public let exceptionType: String
        public let exceptionMessage: String
        public let exceptionStacktrace: String
        public let additionalProperties: [String: JSONValue]

        public init(type: String, exceptionType: String, exceptionMessage: String, exceptionStacktrace: String, additionalProperties: [String: JSONValue]) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct ExceptionV2: Codable, Hashable, Sendable {
        public let value: ExceptionV2

        public init(value: ExceptionV2) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }
}