import Foundation

public enum SubmissionStatusForTestCase: Codable, Hashable, Sendable {
    case graded(TestCaseResultWithStdout)
    case gradedV2(TestCaseGrade)
    case traced(TracedTestCase)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "graded":
            self = .graded(try TestCaseResultWithStdout(from: decoder))
        case "gradedV2":
            self = .gradedV2(try container.decode(TestCaseGrade.self, forKey: .value))
        case "traced":
            self = .traced(try TracedTestCase(from: decoder))
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
        case .graded(let data):
            try container.encode("graded", forKey: .type)
            try data.encode(to: encoder)
        case .gradedV2(let data):
            try container.encode("gradedV2", forKey: .type)
            try container.encode(data, forKey: .value)
        case .traced(let data):
            try container.encode("traced", forKey: .type)
            try data.encode(to: encoder)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
        case value
    }
}