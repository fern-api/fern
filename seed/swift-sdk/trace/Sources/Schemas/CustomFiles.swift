public enum CustomFiles: Codable, Hashable, Sendable {
    case basic(Basic)
    case custom(Custom)

    public struct Basic: Codable, Hashable, Sendable {
        public let type: String = "basic"
        public let methodName: String
        public let signature: NonVoidFunctionSignature
        public let additionalFiles: [Language: Files]
        public let basicTestCaseTemplate: BasicTestCaseTemplate
        public let additionalProperties: [String: JSONValue]

        public init(type: String, methodName: String, signature: NonVoidFunctionSignature, additionalFiles: [Language: Files], basicTestCaseTemplate: BasicTestCaseTemplate, additionalProperties: [String: JSONValue]) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct Custom: Codable, Hashable, Sendable {
        public let value: [Language: Files]

        public init(value: [Language: Files]) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }
}