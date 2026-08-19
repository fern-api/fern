public enum DuplicatePrimitiveVariantsUnion: Codable, Hashable, Sendable {
    case description(String)
    case height(Int)
    case label(String)
    case width(Int)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "description":
            self = .description(try container.decode(String.self, forKey: .value))
        case "height":
            self = .height(try container.decode(Int.self, forKey: .value))
        case "label":
            self = .label(try container.decode(String.self, forKey: .value))
        case "width":
            self = .width(try container.decode(Int.self, forKey: .value))
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
        case .description(let data):
            try container.encode("description", forKey: .type)
            try container.encode(data, forKey: .value)
        case .height(let data):
            try container.encode("height", forKey: .type)
            try container.encode(data, forKey: .value)
        case .label(let data):
            try container.encode("label", forKey: .type)
            try container.encode(data, forKey: .value)
        case .width(let data):
            try container.encode("width", forKey: .type)
            try container.encode(data, forKey: .value)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
        case value
    }
}