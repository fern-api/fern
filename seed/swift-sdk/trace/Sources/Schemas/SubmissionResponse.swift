import Foundation

public enum SubmissionResponse: Codable, Hashable, Sendable {
    case submissionResponseFive(SubmissionResponseFive)
    case submissionResponseFour(SubmissionResponseFour)
    case submissionResponseOne(SubmissionResponseOne)
    case submissionResponseThree(SubmissionResponseThree)
    case submissionResponseTwo(SubmissionResponseTwo)
    case submissionResponseZero(SubmissionResponseZero)

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(SubmissionResponseFive.self) {
            self = .submissionResponseFive(value)
        } else if let value = try? container.decode(SubmissionResponseFour.self) {
            self = .submissionResponseFour(value)
        } else if let value = try? container.decode(SubmissionResponseOne.self) {
            self = .submissionResponseOne(value)
        } else if let value = try? container.decode(SubmissionResponseThree.self) {
            self = .submissionResponseThree(value)
        } else if let value = try? container.decode(SubmissionResponseTwo.self) {
            self = .submissionResponseTwo(value)
        } else if let value = try? container.decode(SubmissionResponseZero.self) {
            self = .submissionResponseZero(value)
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
        case .submissionResponseFive(let value):
            try container.encode(value)
        case .submissionResponseFour(let value):
            try container.encode(value)
        case .submissionResponseOne(let value):
            try container.encode(value)
        case .submissionResponseThree(let value):
            try container.encode(value)
        case .submissionResponseTwo(let value):
            try container.encode(value)
        case .submissionResponseZero(let value):
            try container.encode(value)
        }
    }
}