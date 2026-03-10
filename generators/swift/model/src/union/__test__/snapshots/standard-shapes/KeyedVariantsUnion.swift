public enum KeyedVariantsUnion: Codable, Hashable, Sendable {
    case square(Square)
    case triangle(Triangle)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "square":
            self = .square(try container.decode(Square.self, forKey: .square))
        case "triangle":
            self = .triangle(try container.decode(Triangle.self, forKey: .triangle))
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
        case .square(let data):
            try container.encode("square", forKey: .type)
            try container.encode(data, forKey: .square)
        case .triangle(let data):
            try container.encode("triangle", forKey: .type)
            try container.encode(data, forKey: .triangle)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
        case square
        case triangle
    }
}