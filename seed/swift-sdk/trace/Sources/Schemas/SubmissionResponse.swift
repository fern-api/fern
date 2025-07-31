public enum SubmissionResponse: Codable, Hashable, Sendable {
    case serverInitialized(ServerInitialized)
    case problemInitialized(ProblemInitialized)
    case workspaceInitialized(WorkspaceInitialized)
    case serverErrored(ServerErrored)
    case codeExecutionUpdate(CodeExecutionUpdate)
    case terminated(Terminated)

    public struct ServerInitialized: Codable, Hashable, Sendable {

        public init() {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct ProblemInitialized: Codable, Hashable, Sendable {
        public let value: ProblemId

        public init(value: ProblemId) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct WorkspaceInitialized: Codable, Hashable, Sendable {

        public init() {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct ServerErrored: Codable, Hashable, Sendable {
        public let type: String = "serverErrored"
        public let exceptionType: String
        public let exceptionMessage: String
        public let exceptionStacktrace: String
        public let additionalProperties: [String: JSONValue]

        public init(type: String, exceptionType: String, exceptionMessage: String, exceptionStacktrace: String, additionalProperties: [String: JSONValue]) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct CodeExecutionUpdate: Codable, Hashable, Sendable {
        public let value: CodeExecutionUpdate

        public init(value: CodeExecutionUpdate) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct Terminated: Codable, Hashable, Sendable {
        public let type: String = "terminated"
        public let additionalProperties: [String: JSONValue]

        public init(type: String, additionalProperties: [String: JSONValue]) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }
}