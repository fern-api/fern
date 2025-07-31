public enum InvalidRequestCause: Codable, Hashable, Sendable {
    case submissionIdNotFound(SubmissionIdNotFound)
    case customTestCasesUnsupported(CustomTestCasesUnsupported)
    case unexpectedLanguage(UnexpectedLanguage)

    public struct SubmissionIdNotFound: Codable, Hashable, Sendable {
        public let type: String = "submissionIdNotFound"
        public let missingSubmissionId: SubmissionId
        public let additionalProperties: [String: JSONValue]

        public init(type: String, missingSubmissionId: SubmissionId, additionalProperties: [String: JSONValue]) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct CustomTestCasesUnsupported: Codable, Hashable, Sendable {
        public let type: String = "customTestCasesUnsupported"
        public let problemId: ProblemId
        public let submissionId: SubmissionId
        public let additionalProperties: [String: JSONValue]

        public init(type: String, problemId: ProblemId, submissionId: SubmissionId, additionalProperties: [String: JSONValue]) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct UnexpectedLanguage: Codable, Hashable, Sendable {
        public let type: String = "unexpectedLanguage"
        public let expectedLanguage: Language
        public let actualLanguage: Language
        public let additionalProperties: [String: JSONValue]

        public init(type: String, expectedLanguage: Language, actualLanguage: Language, additionalProperties: [String: JSONValue]) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }
}