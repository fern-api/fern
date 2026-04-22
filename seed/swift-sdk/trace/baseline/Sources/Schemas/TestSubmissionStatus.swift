import Foundation

public enum TestSubmissionStatus: Codable, Hashable, Sendable {
    case errored(ErrorInfo)
    case running(RunningSubmissionState)
    case stopped
    case testCaseIdToState([String: SubmissionStatusForTestCase])

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "errored":
            self = .errored(try container.decode(ErrorInfo.self, forKey: .value))
        case "running":
            self = .running(try container.decode(RunningSubmissionState.self, forKey: .value))
        case "stopped":
            self = .stopped
        case "testCaseIdToState":
            self = .testCaseIdToState(try container.decode([String: SubmissionStatusForTestCase].self, forKey: .value))
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
        case .running(let data):
            try container.encode("running", forKey: .type)
            try container.encode(data, forKey: .value)
        case .stopped:
            try container.encode("stopped", forKey: .type)
        case .testCaseIdToState(let data):
            try container.encode("testCaseIdToState", forKey: .type)
            try container.encode(data, forKey: .value)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
        case value
    }
}