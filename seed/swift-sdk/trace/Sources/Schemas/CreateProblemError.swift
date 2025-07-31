public enum CreateProblemError: Codable, Hashable, Sendable {
    case generic(Generic)

    public struct Generic: Codable, Hashable, Sendable {
        public let errorType: String = "generic"
        public let message: String
        public let type: String
        public let stacktrace: String
        public let additionalProperties: [String: JSONValue]

        public init(errorType: String, message: String, type: String, stacktrace: String, additionalProperties: [String: JSONValue]) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }
}