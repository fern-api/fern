import Foundation

public enum SubmissionRequest: Codable, Hashable, Sendable {
    case submissionRequestFour(SubmissionRequestFour)
    case submissionRequestThree(SubmissionRequestThree)
    case submissionRequestTwo(SubmissionRequestTwo)
    case submissionRequestType(SubmissionRequestType)
    case submissionRequestZero(SubmissionRequestZero)

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(SubmissionRequestFour.self) {
            self = .submissionRequestFour(value)
        } else if let value = try? container.decode(SubmissionRequestThree.self) {
            self = .submissionRequestThree(value)
        } else if let value = try? container.decode(SubmissionRequestTwo.self) {
            self = .submissionRequestTwo(value)
        } else if let value = try? container.decode(SubmissionRequestType.self) {
            self = .submissionRequestType(value)
        } else if let value = try? container.decode(SubmissionRequestZero.self) {
            self = .submissionRequestZero(value)
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
        case .submissionRequestFour(let value):
            try container.encode(value)
        case .submissionRequestThree(let value):
            try container.encode(value)
        case .submissionRequestTwo(let value):
            try container.encode(value)
        case .submissionRequestType(let value):
            try container.encode(value)
        case .submissionRequestZero(let value):
            try container.encode(value)
        }
    }
}