public enum WorkspaceSubmissionUpdateInfo: Codable, Hashable, Sendable {
    case running(Running)
    case ran(Ran)
    case stopped(Stopped)
    case traced(Traced)
    case tracedV2(TracedV2)
    case errored(Errored)
    case finished(Finished)

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

    public struct Stopped: Codable, Hashable, Sendable {

        public init() {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct Traced: Codable, Hashable, Sendable {

        public init() {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }

    public struct TracedV2: Codable, Hashable, Sendable {
        public let type: String = "tracedV2"
        public let traceResponsesSize: Int
        public let additionalProperties: [String: JSONValue]

        public init(type: String, traceResponsesSize: Int, additionalProperties: [String: JSONValue]) {
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

    public struct Finished: Codable, Hashable, Sendable {

        public init() {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }
}