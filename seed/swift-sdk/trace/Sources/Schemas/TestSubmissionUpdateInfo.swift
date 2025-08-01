public enum TestSubmissionUpdateInfo: Codable, Hashable, Sendable {
    case running(Running)
    case stopped(Stopped)
    case errored(Errored)
    case gradedTestCase(GradedTestCase)
    case recordedTestCase(RecordedTestCase)
    case finished(Finished)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
    }

    public struct Running: Codable, Hashable, Sendable {
        public let type: String = "running"
        public let value: RunningSubmissionState
        public let additionalProperties: [String: JSONValue]

        public init(
            value: RunningSubmissionState,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.value = value
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.value = try container.decode(RunningSubmissionState.self, forKey: .value)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.value, forKey: .value)
        }

        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case value
        }
    }

    public struct Stopped: Codable, Hashable, Sendable {
        public let additionalProperties: [String: JSONValue]

        public init(
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            self.additionalProperties = try decoder.decodeAdditionalProperties(knownKeys: [])
        }

        public func encode(to encoder: Encoder) throws -> Void {
            try encoder.encodeAdditionalProperties(self.additionalProperties)
        }
    }

    public struct Errored: Codable, Hashable, Sendable {
        public let type: String = "errored"
        public let value: ErrorInfo
        public let additionalProperties: [String: JSONValue]

        public init(
            value: ErrorInfo,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.value = value
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.value = try container.decode(ErrorInfo.self, forKey: .value)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.value, forKey: .value)
        }

        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case value
        }
    }

    public struct GradedTestCase: Codable, Hashable, Sendable {
        public let type: String = "gradedTestCase"
        public let testCaseId: TestCaseId
        public let grade: TestCaseGrade
        public let additionalProperties: [String: JSONValue]

        public init(
            testCaseId: TestCaseId,
            grade: TestCaseGrade,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.testCaseId = testCaseId
            self.grade = grade
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.testCaseId = try container.decode(TestCaseId.self, forKey: .testCaseId)
            self.grade = try container.decode(TestCaseGrade.self, forKey: .grade)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.testCaseId, forKey: .testCaseId)
            try container.encode(self.grade, forKey: .grade)
        }

        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case testCaseId
            case grade
        }
    }

    public struct RecordedTestCase: Codable, Hashable, Sendable {
        public let type: String = "recordedTestCase"
        public let testCaseId: TestCaseId
        public let traceResponsesSize: Int
        public let additionalProperties: [String: JSONValue]

        public init(
            testCaseId: TestCaseId,
            traceResponsesSize: Int,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.testCaseId = testCaseId
            self.traceResponsesSize = traceResponsesSize
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.testCaseId = try container.decode(TestCaseId.self, forKey: .testCaseId)
            self.traceResponsesSize = try container.decode(Int.self, forKey: .traceResponsesSize)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.testCaseId, forKey: .testCaseId)
            try container.encode(self.traceResponsesSize, forKey: .traceResponsesSize)
        }

        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case testCaseId
            case traceResponsesSize
        }
    }

    public struct Finished: Codable, Hashable, Sendable {
        public let additionalProperties: [String: JSONValue]

        public init(
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            self.additionalProperties = try decoder.decodeAdditionalProperties(knownKeys: [])
        }

        public func encode(to encoder: Encoder) throws -> Void {
            try encoder.encodeAdditionalProperties(self.additionalProperties)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
    }
}