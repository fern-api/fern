import Foundation

public enum AstNode: Codable, Hashable, Sendable {
    case llm(AstNodeLlm)
    case nullLiteral(AstNullNode)
    case text(AstTextNode)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "llm":
            self = .llm(try AstNodeLlm(from: decoder))
        case "null_literal":
            self = .nullLiteral(try AstNullNode(from: decoder))
        case "text":
            self = .text(try AstTextNode(from: decoder))
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
        case .llm(let data):
            try container.encode("llm", forKey: .type)
            try data.encode(to: encoder)
        case .nullLiteral(let data):
            try container.encode("null_literal", forKey: .type)
            try data.encode(to: encoder)
        case .text(let data):
            try container.encode("text", forKey: .type)
            try data.encode(to: encoder)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
    }
}