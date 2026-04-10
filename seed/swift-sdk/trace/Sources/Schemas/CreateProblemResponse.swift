import Foundation

public enum CreateProblemResponse: Codable, Hashable, Sendable {
    case error(CreateProblemError)
    case success(ProblemId)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "error":
            self = .error(try container.decode(CreateProblemError.self, forKey: .value))
        case "success":
            self = .success(try container.decode(ProblemId.self, forKey: .value))
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
        case .error(let data):
            try container.encode("error", forKey: .type)
            try container.encode(data, forKey: .value)
        case .success(let data):
            try container.encode("success", forKey: .type)
            try container.encode(data, forKey: .value)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
        case value
    }
}