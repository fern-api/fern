import Foundation

public enum TestSubmissionUpdateInfo: Codable, Hashable, Sendable {
    case testSubmissionUpdateInfoFive(TestSubmissionUpdateInfoFive)
    case testSubmissionUpdateInfoFour(TestSubmissionUpdateInfoFour)
    case testSubmissionUpdateInfoOne(TestSubmissionUpdateInfoOne)
    case testSubmissionUpdateInfoThree(TestSubmissionUpdateInfoThree)
    case testSubmissionUpdateInfoTwo(TestSubmissionUpdateInfoTwo)
    case testSubmissionUpdateInfoZero(TestSubmissionUpdateInfoZero)

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(TestSubmissionUpdateInfoFive.self) {
            self = .testSubmissionUpdateInfoFive(value)
        } else if let value = try? container.decode(TestSubmissionUpdateInfoFour.self) {
            self = .testSubmissionUpdateInfoFour(value)
        } else if let value = try? container.decode(TestSubmissionUpdateInfoOne.self) {
            self = .testSubmissionUpdateInfoOne(value)
        } else if let value = try? container.decode(TestSubmissionUpdateInfoThree.self) {
            self = .testSubmissionUpdateInfoThree(value)
        } else if let value = try? container.decode(TestSubmissionUpdateInfoTwo.self) {
            self = .testSubmissionUpdateInfoTwo(value)
        } else if let value = try? container.decode(TestSubmissionUpdateInfoZero.self) {
            self = .testSubmissionUpdateInfoZero(value)
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
        case .testSubmissionUpdateInfoFive(let value):
            try container.encode(value)
        case .testSubmissionUpdateInfoFour(let value):
            try container.encode(value)
        case .testSubmissionUpdateInfoOne(let value):
            try container.encode(value)
        case .testSubmissionUpdateInfoThree(let value):
            try container.encode(value)
        case .testSubmissionUpdateInfoTwo(let value):
            try container.encode(value)
        case .testSubmissionUpdateInfoZero(let value):
            try container.encode(value)
        }
    }
}