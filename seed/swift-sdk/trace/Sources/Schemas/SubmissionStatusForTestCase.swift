public enum SubmissionStatusForTestCase: Codable, Hashable, Sendable {
    case graded(Graded)
    case gradedV2(GradedV2)
    case traced(Traced)

    public struct Graded: Codable, Hashable, Sendable {
        public let type: String = "graded"
        public let result: TestCaseResult
        public let stdout: String
        public let additionalProperties: [String: JSONValue]

        public init(type: String, result: TestCaseResult, stdout: String, additionalProperties: [String: JSONValue]) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct GradedV2: Codable, Hashable, Sendable {
        public let value: TestCaseGrade

        public init(value: TestCaseGrade) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct Traced: Codable, Hashable, Sendable {
        public let type: String = "traced"
        public let result: TestCaseResultWithStdout
        public let traceResponsesSize: Int
        public let additionalProperties: [String: JSONValue]

        public init(type: String, result: TestCaseResultWithStdout, traceResponsesSize: Int, additionalProperties: [String: JSONValue]) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }
}