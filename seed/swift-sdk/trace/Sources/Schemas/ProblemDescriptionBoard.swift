public enum ProblemDescriptionBoard: Codable, Hashable, Sendable {
    case html(Html)
    case variable(Variable)
    case testCaseId(TestCaseId)

    public struct Html: Codable, Hashable, Sendable {
        public let value: String

        public init(value: String) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct Variable: Codable, Hashable, Sendable {
        public let value: VariableValue

        public init(value: VariableValue) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct TestCaseId: Codable, Hashable, Sendable {
        public let value: String

        public init(value: String) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }
}