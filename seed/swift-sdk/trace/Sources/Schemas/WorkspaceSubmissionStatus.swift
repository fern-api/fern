public enum WorkspaceSubmissionStatus: Codable, Hashable, Sendable {
    case stopped(Stopped)
    case errored(Errored)
    case running(Running)
    case ran(Ran)
    case traced(Traced)

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

    public struct Ran: Codable, Hashable, Sendable {
        public let type: String = "ran"
        public let exceptionV2: ExceptionV2?
        public let exception: ExceptionInfo?
        public let stdout: String
        public let additionalProperties: [String: JSONValue]

        public init(type: String, exceptionV2: ExceptionV2?, exception: ExceptionInfo?, stdout: String, additionalProperties: [String: JSONValue]) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct Traced: Codable, Hashable, Sendable {
        public let type: String = "traced"
        public let exceptionV2: ExceptionV2?
        public let exception: ExceptionInfo?
        public let stdout: String
        public let additionalProperties: [String: JSONValue]

        public init(type: String, exceptionV2: ExceptionV2?, exception: ExceptionInfo?, stdout: String, additionalProperties: [String: JSONValue]) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }
}