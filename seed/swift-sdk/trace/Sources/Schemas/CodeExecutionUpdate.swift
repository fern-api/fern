public enum CodeExecutionUpdate: Codable, Hashable, Sendable {
    case buildingExecutor(BuildingExecutor)
    case running(Running)
    case errored(Errored)
    case stopped(Stopped)
    case graded(Graded)
    case gradedV2(GradedV2)
    case workspaceRan(WorkspaceRan)
    case recording(Recording)
    case recorded(Recorded)
    case invalidRequest(InvalidRequest)
    case finished(Finished)

    public struct BuildingExecutor: Codable, Hashable, Sendable {
        public let type: String = "buildingExecutor"
        public let submissionId: SubmissionId
        public let status: ExecutionSessionStatus
        public let additionalProperties: [String: JSONValue]

        public init(type: String, submissionId: SubmissionId, status: ExecutionSessionStatus, additionalProperties: [String: JSONValue]) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct Running: Codable, Hashable, Sendable {
        public let type: String = "running"
        public let submissionId: SubmissionId
        public let state: RunningSubmissionState
        public let additionalProperties: [String: JSONValue]

        public init(type: String, submissionId: SubmissionId, state: RunningSubmissionState, additionalProperties: [String: JSONValue]) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct Errored: Codable, Hashable, Sendable {
        public let type: String = "errored"
        public let submissionId: SubmissionId
        public let errorInfo: ErrorInfo
        public let additionalProperties: [String: JSONValue]

        public init(type: String, submissionId: SubmissionId, errorInfo: ErrorInfo, additionalProperties: [String: JSONValue]) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct Stopped: Codable, Hashable, Sendable {
        public let type: String = "stopped"
        public let submissionId: SubmissionId
        public let additionalProperties: [String: JSONValue]

        public init(type: String, submissionId: SubmissionId, additionalProperties: [String: JSONValue]) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct Graded: Codable, Hashable, Sendable {
        public let type: String = "graded"
        public let submissionId: SubmissionId
        public let testCases: [String: TestCaseResultWithStdout]
        public let additionalProperties: [String: JSONValue]

        public init(type: String, submissionId: SubmissionId, testCases: [String: TestCaseResultWithStdout], additionalProperties: [String: JSONValue]) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct GradedV2: Codable, Hashable, Sendable {
        public let type: String = "gradedV2"
        public let submissionId: SubmissionId
        public let testCases: [TestCaseId: TestCaseGrade]
        public let additionalProperties: [String: JSONValue]

        public init(type: String, submissionId: SubmissionId, testCases: [TestCaseId: TestCaseGrade], additionalProperties: [String: JSONValue]) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct WorkspaceRan: Codable, Hashable, Sendable {
        public let type: String = "workspaceRan"
        public let submissionId: SubmissionId
        public let runDetails: WorkspaceRunDetails
        public let additionalProperties: [String: JSONValue]

        public init(type: String, submissionId: SubmissionId, runDetails: WorkspaceRunDetails, additionalProperties: [String: JSONValue]) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct Recording: Codable, Hashable, Sendable {
        public let type: String = "recording"
        public let submissionId: SubmissionId
        public let testCaseId: String?
        public let lineNumber: Int
        public let lightweightStackInfo: LightweightStackframeInformation
        public let tracedFile: TracedFile?
        public let additionalProperties: [String: JSONValue]

        public init(type: String, submissionId: SubmissionId, testCaseId: String?, lineNumber: Int, lightweightStackInfo: LightweightStackframeInformation, tracedFile: TracedFile?, additionalProperties: [String: JSONValue]) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct Recorded: Codable, Hashable, Sendable {
        public let type: String = "recorded"
        public let submissionId: SubmissionId
        public let traceResponsesSize: Int
        public let testCaseId: String?
        public let additionalProperties: [String: JSONValue]

        public init(type: String, submissionId: SubmissionId, traceResponsesSize: Int, testCaseId: String?, additionalProperties: [String: JSONValue]) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct InvalidRequest: Codable, Hashable, Sendable {
        public let type: String = "invalidRequest"
        public let request: SubmissionRequest
        public let cause: InvalidRequestCause
        public let additionalProperties: [String: JSONValue]

        public init(type: String, request: SubmissionRequest, cause: InvalidRequestCause, additionalProperties: [String: JSONValue]) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct Finished: Codable, Hashable, Sendable {
        public let type: String = "finished"
        public let submissionId: SubmissionId
        public let additionalProperties: [String: JSONValue]

        public init(type: String, submissionId: SubmissionId, additionalProperties: [String: JSONValue]) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }
}