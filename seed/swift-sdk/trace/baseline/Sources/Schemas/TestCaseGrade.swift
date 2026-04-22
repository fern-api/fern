import Foundation

public enum TestCaseGrade: Codable, Hashable, Sendable {
    case hidden(TestCaseHiddenGrade)
    case nonHidden(TestCaseNonHiddenGrade)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "hidden":
            self = .hidden(try TestCaseHiddenGrade(from: decoder))
        case "nonHidden":
            self = .nonHidden(try TestCaseNonHiddenGrade(from: decoder))
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
        case .hidden(let data):
            try container.encode("hidden", forKey: .type)
            try data.encode(to: encoder)
        case .nonHidden(let data):
            try container.encode("nonHidden", forKey: .type)
            try data.encode(to: encoder)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
    }
}