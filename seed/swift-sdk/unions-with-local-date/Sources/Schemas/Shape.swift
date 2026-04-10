import Foundation

public enum Shape: Codable, Hashable, Sendable {
    case circle(Circle)
    case square(Square)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "circle":
            self = .circle(try Circle(from: decoder))
        case "square":
            self = .square(try Square(from: decoder))
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
        case .circle(let data):
            try container.encode("circle", forKey: .type)
            try data.encode(to: encoder)
        case .square(let data):
            try container.encode("square", forKey: .type)
            try data.encode(to: encoder)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
    }
}