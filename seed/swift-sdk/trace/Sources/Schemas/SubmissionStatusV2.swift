import Foundation

public enum SubmissionStatusV2: Codable, Hashable, Sendable {
    case submissionStatusV2One(SubmissionStatusV2One)
    case submissionStatusV2Zero(SubmissionStatusV2Zero)

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(SubmissionStatusV2One.self) {
            self = .submissionStatusV2One(value)
        } else if let value = try? container.decode(SubmissionStatusV2Zero.self) {
            self = .submissionStatusV2Zero(value)
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
        case .submissionStatusV2One(let value):
            try container.encode(value)
        case .submissionStatusV2Zero(let value):
            try container.encode(value)
        }
    }
}