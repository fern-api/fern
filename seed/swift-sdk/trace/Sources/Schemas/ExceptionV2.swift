public enum ExceptionV2: Codable, Hashable, Sendable {
    case generic(Generic)
    case timeout(Timeout)

    public struct Generic: Codable, Hashable, Sendable {
        public let type: String = "generic"
        public let exceptionType: String
        public let exceptionMessage: String
        public let exceptionStacktrace: String
        public let additionalProperties: [String: JSONValue]

        public init(type: String, exceptionType: String, exceptionMessage: String, exceptionStacktrace: String, additionalProperties: [String: JSONValue]) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct Timeout: Codable, Hashable, Sendable {

        public init() {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }
}