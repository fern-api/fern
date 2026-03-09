public enum MixedUnion: Codable, Hashable, Sendable {
    case empty
    case namedObject(NamedObject)
    case primitive(Int)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "empty":
            self = .empty
        case "namedObject":
            self = .namedObject(try NamedObject(from: decoder))
        case "primitive":
            self = .primitive(try container.decode(Int.self, forKey: .value))
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
        case .empty:
            try container.encode("empty", forKey: .type)
        case .namedObject(let data):
            try container.encode("namedObject", forKey: .type)
            try data.encode(to: encoder)
        case .primitive(let data):
            try container.encode("primitive", forKey: .type)
            try container.encode(data, forKey: .value)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type = "_type"
        case value
    }
}