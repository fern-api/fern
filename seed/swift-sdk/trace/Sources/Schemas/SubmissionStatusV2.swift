public enum SubmissionStatusV2: Codable, Hashable, Sendable {
    case test(Test)
    case workspace(Workspace)

    public struct Test: Codable, Hashable, Sendable {
        public let type: String = "test"
        public let updates: [TestSubmissionUpdate]
        public let problemId: ProblemId
        public let problemVersion: Int
        public let problemInfo: ProblemInfoV2
        public let additionalProperties: [String: JSONValue]

        public init(type: String, updates: [TestSubmissionUpdate], problemId: ProblemId, problemVersion: Int, problemInfo: ProblemInfoV2, additionalProperties: [String: JSONValue]) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct Workspace: Codable, Hashable, Sendable {
        public let type: String = "workspace"
        public let updates: [WorkspaceSubmissionUpdate]
        public let additionalProperties: [String: JSONValue]

        public init(type: String, updates: [WorkspaceSubmissionUpdate], additionalProperties: [String: JSONValue]) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }
}