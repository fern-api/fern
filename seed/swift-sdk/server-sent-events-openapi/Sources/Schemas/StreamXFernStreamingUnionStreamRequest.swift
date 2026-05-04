import Foundation

/// A discriminated union request matching the Vectara pattern (FER-9556). Each variant inherits stream_response from UnionStreamRequestBase via allOf. The importer pins stream_response to Literal[True/False] at this union level, but the allOf inheritance re-introduces it as boolean in each variant, causing the type conflict.
public enum StreamXFernStreamingUnionStreamRequest: Codable, Hashable, Sendable {
    case compact(UnionStreamCompactVariant)
    case interrupt(UnionStreamInterruptVariant)
    case message(UnionStreamMessageVariant)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "compact":
            self = .compact(try UnionStreamCompactVariant(from: decoder))
        case "interrupt":
            self = .interrupt(try UnionStreamInterruptVariant(from: decoder))
        case "message":
            self = .message(try UnionStreamMessageVariant(from: decoder))
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
        case .compact(let data):
            try container.encode("compact", forKey: .type)
            try data.encode(to: encoder)
        case .interrupt(let data):
            try container.encode("interrupt", forKey: .type)
            try data.encode(to: encoder)
        case .message(let data):
            try container.encode("message", forKey: .type)
            try data.encode(to: encoder)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
    }
}