import Foundation

public enum InvalidRequestCause: Codable, Hashable, Sendable {
    case customTestCasesUnsupported(CustomTestCasesUnsupported)
    /// The submission request references a submission id that doesn't exist.
    case submissionIdNotFound(SubmissionIdNotFound)
    /// The submission request was routed to an incorrect language executor.
    case unexpectedLanguage(UnexpectedLanguageError)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "customTestCasesUnsupported":
            self = .customTestCasesUnsupported(try CustomTestCasesUnsupported(from: decoder))
        case "submissionIdNotFound":
            self = .submissionIdNotFound(try SubmissionIdNotFound(from: decoder))
        case "unexpectedLanguage":
            self = .unexpectedLanguage(try UnexpectedLanguageError(from: decoder))
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
        case .customTestCasesUnsupported(let data):
            try container.encode("customTestCasesUnsupported", forKey: .type)
            try data.encode(to: encoder)
        case .submissionIdNotFound(let data):
            try container.encode("submissionIdNotFound", forKey: .type)
            try data.encode(to: encoder)
        case .unexpectedLanguage(let data):
            try container.encode("unexpectedLanguage", forKey: .type)
            try data.encode(to: encoder)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
    }
}