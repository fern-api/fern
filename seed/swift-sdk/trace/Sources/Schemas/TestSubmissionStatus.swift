public enum TestSubmissionStatus: Codable, Hashable, Sendable {
    case stopped(Stopped)
    case errored(Errored)
    case running(Running)
    case testCaseIdToState(TestCaseIdToState)

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

    public struct Running: Codable, Hashable, Sendable {
        public let value: RunningSubmissionState

        public init(value: RunningSubmissionState) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct TestCaseIdToState: Codable, Hashable, Sendable {
        public let value: [String: SubmissionStatusForTestCase]

        public init(value: [String: SubmissionStatusForTestCase]) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }
}