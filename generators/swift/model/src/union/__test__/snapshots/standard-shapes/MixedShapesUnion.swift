public enum MixedShapesUnion: Codable, Hashable, Sendable {
    case count(Int)
    case dog(Dog)
    case empty

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "count":
            self = .count(try container.decode(Int.self, forKey: .value))
        case "dog":
            self = .dog(try Dog(from: decoder))
        case "empty":
            self = .empty
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
        case .count(let data):
            try container.encode("count", forKey: .type)
            try container.encode(data, forKey: .value)
        case .dog(let data):
            try container.encode("dog", forKey: .type)
            try data.encode(to: encoder)
        case .empty:
            try container.encode("empty", forKey: .type)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
        case value
    }
}