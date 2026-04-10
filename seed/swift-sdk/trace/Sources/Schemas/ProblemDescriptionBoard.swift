import Foundation

public enum ProblemDescriptionBoard: Codable, Hashable, Sendable {
    case html(ProblemDescriptionBoardHtml)
    case testCaseId(ProblemDescriptionBoardTestCaseId)
    case variable(ProblemDescriptionBoardVariable)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "html":
            self = .html(try ProblemDescriptionBoardHtml(from: decoder))
        case "testCaseId":
            self = .testCaseId(try ProblemDescriptionBoardTestCaseId(from: decoder))
        case "variable":
            self = .variable(try ProblemDescriptionBoardVariable(from: decoder))
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
            try data.encode(to: encoder)
        case .testCaseId(let data):
            try container.encode("testCaseId", forKey: .type)
            try data.encode(to: encoder)
        case .variable(let data):
            try container.encode("variable", forKey: .type)
            try data.encode(to: encoder)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
    }
}