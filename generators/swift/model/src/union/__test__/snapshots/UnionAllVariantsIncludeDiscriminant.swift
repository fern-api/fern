public enum UnionAllVariantsIncludeDiscriminant: Codable, Hashable, Sendable {
    case alpha(Alpha)
    case beta(Beta)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "alpha":
            self = .alpha(try Alpha(from: decoder))
        case "beta":
            self = .beta(try Beta(from: decoder))
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
        switch self {
        case .alpha(let data):
            try data.encode(to: encoder)
        case .beta(let data):
            try data.encode(to: encoder)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
    }
}