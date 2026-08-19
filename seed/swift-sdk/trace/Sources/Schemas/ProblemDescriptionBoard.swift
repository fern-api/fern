import Foundation

public enum ProblemDescriptionBoard: Codable, Hashable, Sendable {
    case html(String)
    case testCaseId(String)
    case variable(VariableValue)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "html":
            self = .html(try container.decode(String.self, forKey: .value))
        case "testCaseId":
            self = .testCaseId(try container.decode(String.self, forKey: .value))
        case "variable":
            self = .variable(try container.decode(VariableValue.self, forKey: .value))
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
        case .html(let data):
            try container.encode("html", forKey: .type)
            try container.encode(data, forKey: .value)
        case .testCaseId(let data):
            try container.encode("testCaseId", forKey: .type)
            try container.encode(data, forKey: .value)
        case .variable(let data):
            try container.encode("variable", forKey: .type)
            try container.encode(data, forKey: .value)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
        case value
    }
}