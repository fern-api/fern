public enum DiscriminantKeyCollisionUnion: Codable, Hashable, Sendable {
    case foo

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "foo":
            self = .foo
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
        case .foo:
            try container.encode("foo", forKey: .type)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
    }
}