import Foundation

public enum CreateProblemError: Codable, Hashable, Sendable {
    case generic(GenericCreateProblemError)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .errorType)
        switch discriminant {
        case "generic":
            self = .generic(try GenericCreateProblemError(from: decoder))
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
        case .generic(let data):
            try container.encode("generic", forKey: .errorType)
            try data.encode(to: encoder)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case errorType = "_type"
    }
}