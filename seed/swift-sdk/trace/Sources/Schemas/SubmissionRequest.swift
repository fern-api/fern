public enum SubmissionRequest: Codable, Hashable, Sendable {
    case initializeProblemRequest(InitializeProblemRequest)
    case initializeWorkspaceRequest(InitializeWorkspaceRequest)
    case submitV2(SubmitV2)
    case workspaceSubmit(WorkspaceSubmit)
    case stop(Stop)

    public struct InitializeProblemRequest: Codable, Hashable, Sendable {
        public let type: String = "initializeProblemRequest"
        public let problemId: ProblemId
        public let problemVersion: Int?
        public let additionalProperties: [String: JSONValue]

        public init(type: String, problemId: ProblemId, problemVersion: Int?, additionalProperties: [String: JSONValue]) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct InitializeWorkspaceRequest: Codable, Hashable, Sendable {

        public init() {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct SubmitV2: Codable, Hashable, Sendable {
        public let type: String = "submitV2"
        public let submissionId: SubmissionId
        public let language: Language
        public let submissionFiles: [SubmissionFileInfo]
        public let problemId: ProblemId
        public let problemVersion: Int?
        public let userId: String?
        public let additionalProperties: [String: JSONValue]

        public init(type: String, submissionId: SubmissionId, language: Language, submissionFiles: [SubmissionFileInfo], problemId: ProblemId, problemVersion: Int?, userId: String?, additionalProperties: [String: JSONValue]) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct WorkspaceSubmit: Codable, Hashable, Sendable {
        public let type: String = "workspaceSubmit"
        public let submissionId: SubmissionId
        public let language: Language
        public let submissionFiles: [SubmissionFileInfo]
        public let userId: String?
        public let additionalProperties: [String: JSONValue]

        public init(type: String, submissionId: SubmissionId, language: Language, submissionFiles: [SubmissionFileInfo], userId: String?, additionalProperties: [String: JSONValue]) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct Stop: Codable, Hashable, Sendable {
        public let type: String = "stop"
        public let submissionId: SubmissionId
        public let additionalProperties: [String: JSONValue]

        public init(type: String, submissionId: SubmissionId, additionalProperties: [String: JSONValue]) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }
}