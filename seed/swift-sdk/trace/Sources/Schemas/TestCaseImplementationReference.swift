public enum TestCaseImplementationReference: Codable, Hashable, Sendable {
    case templateId(TemplateId)
    case implementation(Implementation)

    public struct TemplateId: Codable, Hashable, Sendable {
        public let value: TestCaseTemplateId

        public init(value: TestCaseTemplateId) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct Implementation: Codable, Hashable, Sendable {
        public let type: String = "implementation"
        public let description: TestCaseImplementationDescription
        public let function: TestCaseFunction
        public let additionalProperties: [String: JSONValue]

        public init(type: String, description: TestCaseImplementationDescription, function: TestCaseFunction, additionalProperties: [String: JSONValue]) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }
}