import Foundation

public enum AssertCorrectnessCheck: Codable, Hashable, Sendable {
    case custom(VoidFunctionDefinitionThatTakesActualResult)
    case deepEquality(DeepEqualityCorrectnessCheck)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "custom":
            self = .custom(try VoidFunctionDefinitionThatTakesActualResult(from: decoder))
        case "deepEquality":
            self = .deepEquality(try DeepEqualityCorrectnessCheck(from: decoder))
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
        case .custom(let data):
            try container.encode("custom", forKey: .type)
            try data.encode(to: encoder)
        case .deepEquality(let data):
            try container.encode("deepEquality", forKey: .type)
            try data.encode(to: encoder)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
    }
}