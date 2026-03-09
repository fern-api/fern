public enum EmptyVariantsUnion: Codable, Hashable, Sendable {
    case active
    case inactive

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "active":
            self = .active
        case "inactive":
            self = .inactive
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
        case .active:
            try container.encode("active", forKey: .type)
        case .inactive:
            try container.encode("inactive", forKey: .type)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
    }
}