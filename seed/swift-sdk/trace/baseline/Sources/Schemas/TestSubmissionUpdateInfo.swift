import Foundation

public enum TestSubmissionUpdateInfo: Codable, Hashable, Sendable {
    case errored(ErrorInfo)
    case finished
    case gradedTestCase(GradedTestCaseUpdate)
    case recordedTestCase(RecordedTestCaseUpdate)
    case running(RunningSubmissionState)
    case stopped

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "errored":
            self = .errored(try container.decode(ErrorInfo.self, forKey: .value))
        case "finished":
            self = .finished
        case "gradedTestCase":
            self = .gradedTestCase(try GradedTestCaseUpdate(from: decoder))
        case "recordedTestCase":
            self = .recordedTestCase(try RecordedTestCaseUpdate(from: decoder))
        case "running":
            self = .running(try container.decode(RunningSubmissionState.self, forKey: .value))
        case "stopped":
            self = .stopped
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
        var container = encoder.container(keyedBy: CodingKeys.self)
        switch self {
        case .errored(let data):
            try container.encode("errored", forKey: .type)
            try container.encode(data, forKey: .value)
        case .finished:
            try container.encode("finished", forKey: .type)
        case .gradedTestCase(let data):
            try container.encode("gradedTestCase", forKey: .type)
            try data.encode(to: encoder)
        case .recordedTestCase(let data):
            try container.encode("recordedTestCase", forKey: .type)
            try data.encode(to: encoder)
        case .running(let data):
            try container.encode("running", forKey: .type)
            try container.encode(data, forKey: .value)
        case .stopped:
            try container.encode("stopped", forKey: .type)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
        case value
    }
}