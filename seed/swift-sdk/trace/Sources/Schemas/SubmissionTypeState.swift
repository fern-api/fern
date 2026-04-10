import Foundation

public enum SubmissionTypeState: Codable, Hashable, Sendable {
    case submissionTypeStateOne(SubmissionTypeStateOne)
    case submissionTypeStateZero(SubmissionTypeStateZero)

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(SubmissionTypeStateOne.self) {
            self = .submissionTypeStateOne(value)
        } else if let value = try? container.decode(SubmissionTypeStateZero.self) {
            self = .submissionTypeStateZero(value)
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
        case .submissionTypeStateOne(let value):
            try container.encode(value)
        case .submissionTypeStateZero(let value):
            try container.encode(value)
        }
    }
}