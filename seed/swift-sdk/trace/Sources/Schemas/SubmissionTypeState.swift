public enum SubmissionTypeState: Codable, Hashable, Sendable {
    case test(Test)
    case workspace(Workspace)

    public struct Test: Codable, Hashable, Sendable {
        public let type: String = "test"
        public let problemId: ProblemId
        public let defaultTestCases: [TestCase]
        public let customTestCases: [TestCase]
        public let status: TestSubmissionStatus
        public let additionalProperties: [String: JSONValue]

        public init(type: String, problemId: ProblemId, defaultTestCases: [TestCase], customTestCases: [TestCase], status: TestSubmissionStatus, additionalProperties: [String: JSONValue]) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct Workspace: Codable, Hashable, Sendable {
        public let type: String = "workspace"
        public let status: WorkspaceSubmissionStatus
        public let additionalProperties: [String: JSONValue]

        public init(type: String, status: WorkspaceSubmissionStatus, additionalProperties: [String: JSONValue]) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }
}