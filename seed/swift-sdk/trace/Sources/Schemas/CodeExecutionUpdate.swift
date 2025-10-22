import Foundation

public enum CodeExecutionUpdate: Codable, Hashable, Sendable {
    /// Statuses if an executor for the session isn't ready (Before RunningResponse).
    case buildingExecutor(BuildingExecutor)
    /// Sent if a submission cannot be run (i.e. Compile Error).
    case errored(Errored)
    /// Sent once a submission is graded and fully recorded.
    case finished(Finished)
    /// Graded testcases without trace information.
    case graded(Graded)
    /// Graded submission for v2 problems.
    case gradedV2(GradedV2)
    /// Sent if an invalid request is sent for a submission.
    case invalidRequest(InvalidRequest)
    /// Graded testcases with trace information.
    case recorded(Recorded)
    /// Gives progress about what is being recorded.
    case recording(Recording)
    /// Sent once a test submission is executing.
    case running(Running)
    /// Sent if a submission is stopped.
    case stopped(Stopped)
    /// Workspace run without trace information.
    case workspaceRan(WorkspaceRan)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "buildingExecutor":
            self = .buildingExecutor(try BuildingExecutor(from: decoder))
        case "errored":
            self = .errored(try Errored(from: decoder))
        case "finished":
            self = .finished(try Finished(from: decoder))
        case "graded":
            self = .graded(try Graded(from: decoder))
        case "gradedV2":
            self = .gradedV2(try GradedV2(from: decoder))
        case "invalidRequest":
            self = .invalidRequest(try InvalidRequest(from: decoder))
        case "recorded":
            self = .recorded(try Recorded(from: decoder))
        case "recording":
            self = .recording(try Recording(from: decoder))
        case "running":
            self = .running(try Running(from: decoder))
        case "stopped":
            self = .stopped(try Stopped(from: decoder))
        case "workspaceRan":
            self = .workspaceRan(try WorkspaceRan(from: decoder))
        default:
            throw DecodingError.dataCorrupted(
                DecodingError.Context(
                    codingPath: decoder.codingPath,
                    debugDescription: "Unknown shape discriminant value: \(discriminant)"
                )
            )
        }
    }

    public func encode(to encoder: Encoder) throws -> Void {
        switch self {
        case .buildingExecutor(let data):
            try data.encode(to: encoder)
        case .errored(let data):
            try data.encode(to: encoder)
        case .finished(let data):
            try data.encode(to: encoder)
        case .graded(let data):
            try data.encode(to: encoder)
        case .gradedV2(let data):
            try data.encode(to: encoder)
        case .invalidRequest(let data):
            try data.encode(to: encoder)
        case .recorded(let data):
            try data.encode(to: encoder)
        case .recording(let data):
            try data.encode(to: encoder)
        case .running(let data):
            try data.encode(to: encoder)
        case .stopped(let data):
            try data.encode(to: encoder)
        case .workspaceRan(let data):
            try data.encode(to: encoder)
        }
    }

    /// Statuses if an executor for the session isn't ready (Before RunningResponse).
    public struct BuildingExecutor: Codable, Hashable, Sendable {
        public let type: String = "buildingExecutor"
        public let submissionId: SubmissionId
        public let status: ExecutionSessionStatus
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            submissionId: SubmissionId,
            status: ExecutionSessionStatus,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.submissionId = submissionId
            self.status = status
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.submissionId = try container.decode(SubmissionId.self, forKey: .submissionId)
            self.status = try container.decode(ExecutionSessionStatus.self, forKey: .status)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.submissionId, forKey: .submissionId)
            try container.encode(self.status, forKey: .status)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case submissionId
            case status
        }
    }

    /// Sent once a test submission is executing.
    public struct Running: Codable, Hashable, Sendable {
        public let type: String = "running"
        public let submissionId: SubmissionId
        public let state: RunningSubmissionState
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            submissionId: SubmissionId,
            state: RunningSubmissionState,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.submissionId = submissionId
            self.state = state
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.submissionId = try container.decode(SubmissionId.self, forKey: .submissionId)
            self.state = try container.decode(RunningSubmissionState.self, forKey: .state)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.submissionId, forKey: .submissionId)
            try container.encode(self.state, forKey: .state)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case submissionId
            case state
        }
    }

    /// Sent if a submission cannot be run (i.e. Compile Error).
    public struct Errored: Codable, Hashable, Sendable {
        public let type: String = "errored"
        public let submissionId: SubmissionId
        public let errorInfo: ErrorInfo
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            submissionId: SubmissionId,
            errorInfo: ErrorInfo,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.submissionId = submissionId
            self.errorInfo = errorInfo
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.submissionId = try container.decode(SubmissionId.self, forKey: .submissionId)
            self.errorInfo = try container.decode(ErrorInfo.self, forKey: .errorInfo)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.submissionId, forKey: .submissionId)
            try container.encode(self.errorInfo, forKey: .errorInfo)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case submissionId
            case errorInfo
        }
    }

    /// Sent if a submission is stopped.
    public struct Stopped: Codable, Hashable, Sendable {
        public let type: String = "stopped"
        public let submissionId: SubmissionId
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            submissionId: SubmissionId,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.submissionId = submissionId
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.submissionId = try container.decode(SubmissionId.self, forKey: .submissionId)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.submissionId, forKey: .submissionId)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case submissionId
        }
    }

    /// Graded testcases without trace information.
    public struct Graded: Codable, Hashable, Sendable {
        public let type: String = "graded"
        public let submissionId: SubmissionId
        public let testCases: [String: TestCaseResultWithStdout]
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            submissionId: SubmissionId,
            testCases: [String: TestCaseResultWithStdout],
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.submissionId = submissionId
            self.testCases = testCases
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.submissionId = try container.decode(SubmissionId.self, forKey: .submissionId)
            self.testCases = try container.decode([String: TestCaseResultWithStdout].self, forKey: .testCases)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.submissionId, forKey: .submissionId)
            try container.encode(self.testCases, forKey: .testCases)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case submissionId
            case testCases
        }
    }

    /// Graded submission for v2 problems.
    public struct GradedV2: Codable, Hashable, Sendable {
        public let type: String = "gradedV2"
        public let submissionId: SubmissionId
        public let testCases: [TestCaseId: TestCaseGrade]
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            submissionId: SubmissionId,
            testCases: [TestCaseId: TestCaseGrade],
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.submissionId = submissionId
            self.testCases = testCases
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.submissionId = try container.decode(SubmissionId.self, forKey: .submissionId)
            self.testCases = try container.decode([TestCaseId: TestCaseGrade].self, forKey: .testCases)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.submissionId, forKey: .submissionId)
            try container.encode(self.testCases, forKey: .testCases)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case submissionId
            case testCases
        }
    }

    /// Workspace run without trace information.
    public struct WorkspaceRan: Codable, Hashable, Sendable {
        public let type: String = "workspaceRan"
        public let submissionId: SubmissionId
        public let runDetails: WorkspaceRunDetails
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            submissionId: SubmissionId,
            runDetails: WorkspaceRunDetails,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.submissionId = submissionId
            self.runDetails = runDetails
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.submissionId = try container.decode(SubmissionId.self, forKey: .submissionId)
            self.runDetails = try container.decode(WorkspaceRunDetails.self, forKey: .runDetails)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.submissionId, forKey: .submissionId)
            try container.encode(self.runDetails, forKey: .runDetails)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case submissionId
            case runDetails
        }
    }

    /// Gives progress about what is being recorded.
    public struct Recording: Codable, Hashable, Sendable {
        public let type: String = "recording"
        public let submissionId: SubmissionId
        public let testCaseId: String?
        public let lineNumber: Int
        public let lightweightStackInfo: LightweightStackframeInformation
        public let tracedFile: TracedFile?
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            submissionId: SubmissionId,
            testCaseId: String? = nil,
            lineNumber: Int,
            lightweightStackInfo: LightweightStackframeInformation,
            tracedFile: TracedFile? = nil,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.submissionId = submissionId
            self.testCaseId = testCaseId
            self.lineNumber = lineNumber
            self.lightweightStackInfo = lightweightStackInfo
            self.tracedFile = tracedFile
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.submissionId = try container.decode(SubmissionId.self, forKey: .submissionId)
            self.testCaseId = try container.decodeIfPresent(String.self, forKey: .testCaseId)
            self.lineNumber = try container.decode(Int.self, forKey: .lineNumber)
            self.lightweightStackInfo = try container.decode(LightweightStackframeInformation.self, forKey: .lightweightStackInfo)
            self.tracedFile = try container.decodeIfPresent(TracedFile.self, forKey: .tracedFile)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.submissionId, forKey: .submissionId)
            try container.encodeIfPresent(self.testCaseId, forKey: .testCaseId)
            try container.encode(self.lineNumber, forKey: .lineNumber)
            try container.encode(self.lightweightStackInfo, forKey: .lightweightStackInfo)
            try container.encodeIfPresent(self.tracedFile, forKey: .tracedFile)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case submissionId
            case testCaseId
            case lineNumber
            case lightweightStackInfo
            case tracedFile
        }
    }

    /// Graded testcases with trace information.
    public struct Recorded: Codable, Hashable, Sendable {
        public let type: String = "recorded"
        public let submissionId: SubmissionId
        public let traceResponsesSize: Int
        public let testCaseId: String?
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            submissionId: SubmissionId,
            traceResponsesSize: Int,
            testCaseId: String? = nil,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.submissionId = submissionId
            self.traceResponsesSize = traceResponsesSize
            self.testCaseId = testCaseId
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.submissionId = try container.decode(SubmissionId.self, forKey: .submissionId)
            self.traceResponsesSize = try container.decode(Int.self, forKey: .traceResponsesSize)
            self.testCaseId = try container.decodeIfPresent(String.self, forKey: .testCaseId)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.submissionId, forKey: .submissionId)
            try container.encode(self.traceResponsesSize, forKey: .traceResponsesSize)
            try container.encodeIfPresent(self.testCaseId, forKey: .testCaseId)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case submissionId
            case traceResponsesSize
            case testCaseId
        }
    }

    /// Sent if an invalid request is sent for a submission.
    public struct InvalidRequest: Codable, Hashable, Sendable {
        public let type: String = "invalidRequest"
        public let request: SubmissionRequest
        public let cause: InvalidRequestCause
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            request: SubmissionRequest,
            cause: InvalidRequestCause,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.request = request
            self.cause = cause
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.request = try container.decode(SubmissionRequest.self, forKey: .request)
            self.cause = try container.decode(InvalidRequestCause.self, forKey: .cause)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.request, forKey: .request)
            try container.encode(self.cause, forKey: .cause)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case request
            case cause
        }
    }

    /// Sent once a submission is graded and fully recorded.
    public struct Finished: Codable, Hashable, Sendable {
        public let type: String = "finished"
        public let submissionId: SubmissionId
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            submissionId: SubmissionId,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.submissionId = submissionId
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.submissionId = try container.decode(SubmissionId.self, forKey: .submissionId)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.submissionId, forKey: .submissionId)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case submissionId
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
    }
}