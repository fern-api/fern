import Foundation

public enum SubmissionStatusForTestCase: Codable, Hashable, Sendable {
    case submissionStatusForTestCaseTwo(SubmissionStatusForTestCaseTwo)
    case submissionStatusForTestCaseType(SubmissionStatusForTestCaseType)
    case submissionStatusForTestCaseZero(SubmissionStatusForTestCaseZero)

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(SubmissionStatusForTestCaseTwo.self) {
            self = .submissionStatusForTestCaseTwo(value)
        } else if let value = try? container.decode(SubmissionStatusForTestCaseType.self) {
            self = .submissionStatusForTestCaseType(value)
        } else if let value = try? container.decode(SubmissionStatusForTestCaseZero.self) {
            self = .submissionStatusForTestCaseZero(value)
        } else {
            throw DecodingError.dataCorruptedError(
                in: container,
                debugDescription: "Unexpected value."
            )
        }
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.singleValueContainer()
        switch self {
        case .submissionStatusForTestCaseTwo(let value):
            try container.encode(value)
        case .submissionStatusForTestCaseType(let value):
            try container.encode(value)
        case .submissionStatusForTestCaseZero(let value):
            try container.encode(value)
        }
    }
}