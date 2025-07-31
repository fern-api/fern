public enum TestSubmissionUpdateInfo: Codable, Hashable, Sendable {
    case running(Running)
    case stopped(Stopped)
    case errored(Errored)
    case gradedTestCase(GradedTestCase)
    case recordedTestCase(RecordedTestCase)
    case finished(Finished)

    public struct Running: Codable, Hashable, Sendable {
        public let value: RunningSubmissionState

        public init(value: RunningSubmissionState) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct Stopped: Codable, Hashable, Sendable {

        public init() {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct Errored: Codable, Hashable, Sendable {
        public let value: ErrorInfo

        public init(value: ErrorInfo) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct GradedTestCase: Codable, Hashable, Sendable {
        public let type: String = "gradedTestCase"
        public let testCaseId: TestCaseId
        public let grade: TestCaseGrade
        public let additionalProperties: [String: JSONValue]

        public init(type: String, testCaseId: TestCaseId, grade: TestCaseGrade, additionalProperties: [String: JSONValue]) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct RecordedTestCase: Codable, Hashable, Sendable {
        public let type: String = "recordedTestCase"
        public let testCaseId: TestCaseId
        public let traceResponsesSize: Int
        public let additionalProperties: [String: JSONValue]

        public init(type: String, testCaseId: TestCaseId, traceResponsesSize: Int, additionalProperties: [String: JSONValue]) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct Finished: Codable, Hashable, Sendable {

        public init() {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }
}