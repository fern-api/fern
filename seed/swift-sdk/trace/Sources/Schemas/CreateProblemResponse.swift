import Foundation

public enum CreateProblemResponse: Codable, Hashable, Sendable {
    case error(CreateProblemResponseError)
    case success(CreateProblemResponseSuccess)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "error":
            self = .error(try CreateProblemResponseError(from: decoder))
        case "success":
            self = .success(try CreateProblemResponseSuccess(from: decoder))
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
            try data.encode(to: encoder)
        case .success(let data):
            try container.encode("success", forKey: .type)
            try data.encode(to: encoder)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
    }
}