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
        public let _additionalProperties: [String: JSONValue]

        public init(
            submissionId: SubmissionId,
            status: ExecutionSessionStatus,
            additionalProperties: [String: JSONValue],
            _additionalProperties: [String: JSONValue] = .init()
        ) {
            self.submissionId = submissionId
            self.status = status
            self.additionalProperties = additionalProperties
            self._additionalProperties = _additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.submissionId = try container.decode(SubmissionId.self, forKey: .submissionId)
            self.status = try container.decode(ExecutionSessionStatus.self, forKey: .status)
            self.additionalProperties = try container.decode([String: JSONValue].self, forKey: .additionalProperties)
            self._additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self._additionalProperties)
            try container.encode(self.submissionId, forKey: .submissionId)
            try container.encode(self.status, forKey: .status)
            try container.encode(self.additionalProperties, forKey: .additionalProperties)
        }

        enum CodingKeys: String, CodingKey, CaseIterable {
            case submissionId = "placeholder"
            case status = "placeholder"
            case additionalProperties = "placeholder"
        }
    }

    public struct Running: Codable, Hashable, Sendable {
        public let type: String = "running"
        public let submissionId: SubmissionId
        public let state: RunningSubmissionState
        public let additionalProperties: [String: JSONValue]
        public let _additionalProperties: [String: JSONValue]

        public init(
            submissionId: SubmissionId,
            state: RunningSubmissionState,
            additionalProperties: [String: JSONValue],
            _additionalProperties: [String: JSONValue] = .init()
        ) {
            self.submissionId = submissionId
            self.state = state
            self.additionalProperties = additionalProperties
            self._additionalProperties = _additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.submissionId = try container.decode(SubmissionId.self, forKey: .submissionId)
            self.state = try container.decode(RunningSubmissionState.self, forKey: .state)
            self.additionalProperties = try container.decode([String: JSONValue].self, forKey: .additionalProperties)
            self._additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self._additionalProperties)
            try container.encode(self.submissionId, forKey: .submissionId)
            try container.encode(self.state, forKey: .state)
            try container.encode(self.additionalProperties, forKey: .additionalProperties)
        }

        enum CodingKeys: String, CodingKey, CaseIterable {
            case submissionId = "placeholder"
            case state = "placeholder"
            case additionalProperties = "placeholder"
        }
    }

    public struct Errored: Codable, Hashable, Sendable {
        public let type: String = "errored"
        public let submissionId: SubmissionId
        public let errorInfo: ErrorInfo
        public let additionalProperties: [String: JSONValue]
        public let _additionalProperties: [String: JSONValue]

        public init(
            submissionId: SubmissionId,
            errorInfo: ErrorInfo,
            additionalProperties: [String: JSONValue],
            _additionalProperties: [String: JSONValue] = .init()
        ) {
            self.submissionId = submissionId
            self.errorInfo = errorInfo
            self.additionalProperties = additionalProperties
            self._additionalProperties = _additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.submissionId = try container.decode(SubmissionId.self, forKey: .submissionId)
            self.errorInfo = try container.decode(ErrorInfo.self, forKey: .errorInfo)
            self.additionalProperties = try container.decode([String: JSONValue].self, forKey: .additionalProperties)
            self._additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self._additionalProperties)
            try container.encode(self.submissionId, forKey: .submissionId)
            try container.encode(self.errorInfo, forKey: .errorInfo)
            try container.encode(self.additionalProperties, forKey: .additionalProperties)
        }

        enum CodingKeys: String, CodingKey, CaseIterable {
            case submissionId = "placeholder"
            case errorInfo = "placeholder"
            case additionalProperties = "placeholder"
        }
    }

    public struct Stopped: Codable, Hashable, Sendable {
        public let type: String = "stopped"
        public let submissionId: SubmissionId
        public let additionalProperties: [String: JSONValue]
        public let _additionalProperties: [String: JSONValue]

        public init(
            submissionId: SubmissionId,
            additionalProperties: [String: JSONValue],
            _additionalProperties: [String: JSONValue] = .init()
        ) {
            self.submissionId = submissionId
            self.additionalProperties = additionalProperties
            self._additionalProperties = _additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.submissionId = try container.decode(SubmissionId.self, forKey: .submissionId)
            self.additionalProperties = try container.decode([String: JSONValue].self, forKey: .additionalProperties)
            self._additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self._additionalProperties)
            try container.encode(self.submissionId, forKey: .submissionId)
            try container.encode(self.additionalProperties, forKey: .additionalProperties)
        }

        enum CodingKeys: String, CodingKey, CaseIterable {
            case submissionId = "placeholder"
            case additionalProperties = "placeholder"
        }
    }

    public struct Graded: Codable, Hashable, Sendable {
        public let type: String = "graded"
        public let submissionId: SubmissionId
        public let testCases: [String: TestCaseResultWithStdout]
        public let additionalProperties: [String: JSONValue]
        public let _additionalProperties: [String: JSONValue]

        public init(
            submissionId: SubmissionId,
            testCases: [String: TestCaseResultWithStdout],
            additionalProperties: [String: JSONValue],
            _additionalProperties: [String: JSONValue] = .init()
        ) {
            self.submissionId = submissionId
            self.testCases = testCases
            self.additionalProperties = additionalProperties
            self._additionalProperties = _additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.submissionId = try container.decode(SubmissionId.self, forKey: .submissionId)
            self.testCases = try container.decode([String: TestCaseResultWithStdout].self, forKey: .testCases)
            self.additionalProperties = try container.decode([String: JSONValue].self, forKey: .additionalProperties)
            self._additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self._additionalProperties)
            try container.encode(self.submissionId, forKey: .submissionId)
            try container.encode(self.testCases, forKey: .testCases)
            try container.encode(self.additionalProperties, forKey: .additionalProperties)
        }

        enum CodingKeys: String, CodingKey, CaseIterable {
            case submissionId = "placeholder"
            case testCases = "placeholder"
            case additionalProperties = "placeholder"
        }
    }

    public struct GradedV2: Codable, Hashable, Sendable {
        public let type: String = "gradedV2"
        public let submissionId: SubmissionId
        public let testCases: [TestCaseId: TestCaseGrade]
        public let additionalProperties: [String: JSONValue]
        public let _additionalProperties: [String: JSONValue]

        public init(
            submissionId: SubmissionId,
            testCases: [TestCaseId: TestCaseGrade],
            additionalProperties: [String: JSONValue],
            _additionalProperties: [String: JSONValue] = .init()
        ) {
            self.submissionId = submissionId
            self.testCases = testCases
            self.additionalProperties = additionalProperties
            self._additionalProperties = _additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.submissionId = try container.decode(SubmissionId.self, forKey: .submissionId)
            self.testCases = try container.decode([TestCaseId: TestCaseGrade].self, forKey: .testCases)
            self.additionalProperties = try container.decode([String: JSONValue].self, forKey: .additionalProperties)
            self._additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self._additionalProperties)
            try container.encode(self.submissionId, forKey: .submissionId)
            try container.encode(self.testCases, forKey: .testCases)
            try container.encode(self.additionalProperties, forKey: .additionalProperties)
        }

        enum CodingKeys: String, CodingKey, CaseIterable {
            case submissionId = "placeholder"
            case testCases = "placeholder"
            case additionalProperties = "placeholder"
        }
    }

    public struct WorkspaceRan: Codable, Hashable, Sendable {
        public let type: String = "workspaceRan"
        public let submissionId: SubmissionId
        public let runDetails: WorkspaceRunDetails
        public let additionalProperties: [String: JSONValue]
        public let _additionalProperties: [String: JSONValue]

        public init(
            submissionId: SubmissionId,
            runDetails: WorkspaceRunDetails,
            additionalProperties: [String: JSONValue],
            _additionalProperties: [String: JSONValue] = .init()
        ) {
            self.submissionId = submissionId
            self.runDetails = runDetails
            self.additionalProperties = additionalProperties
            self._additionalProperties = _additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.submissionId = try container.decode(SubmissionId.self, forKey: .submissionId)
            self.runDetails = try container.decode(WorkspaceRunDetails.self, forKey: .runDetails)
            self.additionalProperties = try container.decode([String: JSONValue].self, forKey: .additionalProperties)
            self._additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self._additionalProperties)
            try container.encode(self.submissionId, forKey: .submissionId)
            try container.encode(self.runDetails, forKey: .runDetails)
            try container.encode(self.additionalProperties, forKey: .additionalProperties)
        }

        enum CodingKeys: String, CodingKey, CaseIterable {
            case submissionId = "placeholder"
            case runDetails = "placeholder"
            case additionalProperties = "placeholder"
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
        public let _additionalProperties: [String: JSONValue]

        public init(
            submissionId: SubmissionId,
            testCaseId: String? = nil,
            lineNumber: Int,
            lightweightStackInfo: LightweightStackframeInformation,
            tracedFile: TracedFile? = nil,
            additionalProperties: [String: JSONValue],
            _additionalProperties: [String: JSONValue] = .init()
        ) {
            self.submissionId = submissionId
            self.testCaseId = testCaseId
            self.lineNumber = lineNumber
            self.lightweightStackInfo = lightweightStackInfo
            self.tracedFile = tracedFile
            self.additionalProperties = additionalProperties
            self._additionalProperties = _additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.submissionId = try container.decode(SubmissionId.self, forKey: .submissionId)
            self.testCaseId = try container.decodeIfPresent(String.self, forKey: .testCaseId)
            self.lineNumber = try container.decode(Int.self, forKey: .lineNumber)
            self.lightweightStackInfo = try container.decode(LightweightStackframeInformation.self, forKey: .lightweightStackInfo)
            self.tracedFile = try container.decodeIfPresent(TracedFile.self, forKey: .tracedFile)
            self.additionalProperties = try container.decode([String: JSONValue].self, forKey: .additionalProperties)
            self._additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self._additionalProperties)
            try container.encode(self.submissionId, forKey: .submissionId)
            try container.encodeIfPresent(self.testCaseId, forKey: .testCaseId)
            try container.encode(self.lineNumber, forKey: .lineNumber)
            try container.encode(self.lightweightStackInfo, forKey: .lightweightStackInfo)
            try container.encodeIfPresent(self.tracedFile, forKey: .tracedFile)
            try container.encode(self.additionalProperties, forKey: .additionalProperties)
        }

        enum CodingKeys: String, CodingKey, CaseIterable {
            case submissionId = "placeholder"
            case testCaseId = "placeholder"
            case lineNumber = "placeholder"
            case lightweightStackInfo = "placeholder"
            case tracedFile = "placeholder"
            case additionalProperties = "placeholder"
        }
    }

    public struct Recorded: Codable, Hashable, Sendable {
        public let type: String = "recorded"
        public let submissionId: SubmissionId
        public let traceResponsesSize: Int
        public let testCaseId: String?
        public let additionalProperties: [String: JSONValue]
        public let _additionalProperties: [String: JSONValue]

        public init(
            submissionId: SubmissionId,
            traceResponsesSize: Int,
            testCaseId: String? = nil,
            additionalProperties: [String: JSONValue],
            _additionalProperties: [String: JSONValue] = .init()
        ) {
            self.submissionId = submissionId
            self.traceResponsesSize = traceResponsesSize
            self.testCaseId = testCaseId
            self.additionalProperties = additionalProperties
            self._additionalProperties = _additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.submissionId = try container.decode(SubmissionId.self, forKey: .submissionId)
            self.traceResponsesSize = try container.decode(Int.self, forKey: .traceResponsesSize)
            self.testCaseId = try container.decodeIfPresent(String.self, forKey: .testCaseId)
            self.additionalProperties = try container.decode([String: JSONValue].self, forKey: .additionalProperties)
            self._additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self._additionalProperties)
            try container.encode(self.submissionId, forKey: .submissionId)
            try container.encode(self.traceResponsesSize, forKey: .traceResponsesSize)
            try container.encodeIfPresent(self.testCaseId, forKey: .testCaseId)
            try container.encode(self.additionalProperties, forKey: .additionalProperties)
        }

        enum CodingKeys: String, CodingKey, CaseIterable {
            case submissionId = "placeholder"
            case traceResponsesSize = "placeholder"
            case testCaseId = "placeholder"
            case additionalProperties = "placeholder"
        }
    }

    public struct InvalidRequest: Codable, Hashable, Sendable {
        public let type: String = "invalidRequest"
        public let request: SubmissionRequest
        public let cause: InvalidRequestCause
        public let additionalProperties: [String: JSONValue]
        public let _additionalProperties: [String: JSONValue]

        public init(
            request: SubmissionRequest,
            cause: InvalidRequestCause,
            additionalProperties: [String: JSONValue],
            _additionalProperties: [String: JSONValue] = .init()
        ) {
            self.request = request
            self.cause = cause
            self.additionalProperties = additionalProperties
            self._additionalProperties = _additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.request = try container.decode(SubmissionRequest.self, forKey: .request)
            self.cause = try container.decode(InvalidRequestCause.self, forKey: .cause)
            self.additionalProperties = try container.decode([String: JSONValue].self, forKey: .additionalProperties)
            self._additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self._additionalProperties)
            try container.encode(self.request, forKey: .request)
            try container.encode(self.cause, forKey: .cause)
            try container.encode(self.additionalProperties, forKey: .additionalProperties)
        }

        enum CodingKeys: String, CodingKey, CaseIterable {
            case request = "placeholder"
            case cause = "placeholder"
            case additionalProperties = "placeholder"
        }
    }

    public struct Finished: Codable, Hashable, Sendable {
        public let type: String = "finished"
        public let submissionId: SubmissionId
        public let additionalProperties: [String: JSONValue]
        public let _additionalProperties: [String: JSONValue]

        public init(
            submissionId: SubmissionId,
            additionalProperties: [String: JSONValue],
            _additionalProperties: [String: JSONValue] = .init()
        ) {
            self.submissionId = submissionId
            self.additionalProperties = additionalProperties
            self._additionalProperties = _additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.submissionId = try container.decode(SubmissionId.self, forKey: .submissionId)
            self.additionalProperties = try container.decode([String: JSONValue].self, forKey: .additionalProperties)
            self._additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self._additionalProperties)
            try container.encode(self.submissionId, forKey: .submissionId)
            try container.encode(self.additionalProperties, forKey: .additionalProperties)
        }

        enum CodingKeys: String, CodingKey, CaseIterable {
            case submissionId = "placeholder"
            case additionalProperties = "placeholder"
        }
    }
}