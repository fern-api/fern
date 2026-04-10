import Foundation

public enum TestSubmissionStatus: Codable, Hashable, Sendable {
    case errored(TestSubmissionStatusErrored)
    case running(TestSubmissionStatusRunning)
    case stopped(TestSubmissionStatusStopped)
    case testCaseIdToState(TestSubmissionStatusTestCaseIdToState)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "errored":
            self = .errored(try TestSubmissionStatusErrored(from: decoder))
        case "running":
            self = .running(try TestSubmissionStatusRunning(from: decoder))
        case "stopped":
            self = .stopped(try TestSubmissionStatusStopped(from: decoder))
        case "testCaseIdToState":
            self = .testCaseIdToState(try TestSubmissionStatusTestCaseIdToState(from: decoder))
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
            try data.encode(to: encoder)
        case .running(let data):
            try container.encode("running", forKey: .type)
            try data.encode(to: encoder)
        case .stopped(let data):
            try container.encode("stopped", forKey: .type)
            try data.encode(to: encoder)
        case .testCaseIdToState(let data):
            try container.encode("testCaseIdToState", forKey: .type)
            try data.encode(to: encoder)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
    }
}