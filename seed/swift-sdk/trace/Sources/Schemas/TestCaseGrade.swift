import Foundation

public enum TestCaseGrade: Codable, Hashable, Sendable {
    case testCaseGradeOne(TestCaseGradeOne)
    case testCaseGradeZero(TestCaseGradeZero)

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(TestCaseGradeOne.self) {
            self = .testCaseGradeOne(value)
        } else if let value = try? container.decode(TestCaseGradeZero.self) {
            self = .testCaseGradeZero(value)
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
        case .testCaseGradeOne(let value):
            try container.encode(value)
        case .testCaseGradeZero(let value):
            try container.encode(value)
        }
    }
}