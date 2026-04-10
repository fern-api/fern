import Foundation

/// Undiscriminated union with multiple object variants.
/// This reproduces the Pipedream issue where Emitter is a union of
/// DeployedComponent, HttpInterface, and TimerInterface.
public enum MyUnion: Codable, Hashable, Sendable {
    case a(VariantA)
    case b(VariantB)
    case c(VariantC)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "A":
            self = .a(try VariantA(from: decoder))
        case "B":
            self = .b(try VariantB(from: decoder))
        case "C":
            self = .c(try VariantC(from: decoder))
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
        case .a(let data):
            try container.encode("A", forKey: .type)
            try data.encode(to: encoder)
        case .b(let data):
            try container.encode("B", forKey: .type)
            try data.encode(to: encoder)
        case .c(let data):
            try container.encode("C", forKey: .type)
            try data.encode(to: encoder)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
    }
}