import Foundation

/// A node representing an LLM call. This is a oneOf of two object shapes
/// sharing the same discriminant value, to test that the importer merges
/// them into a single object rather than wrapping in a "value" property.
public enum AstllmNode: Codable, Hashable, Sendable {
    case astllmNodeWithSchema(AstllmNodeWithSchema)
    case astllmNodeWithPrompt(AstllmNodeWithPrompt)

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(AstllmNodeWithSchema.self) {
            self = .astllmNodeWithSchema(value)
        } else if let value = try? container.decode(AstllmNodeWithPrompt.self) {
            self = .astllmNodeWithPrompt(value)
        } else {
            throw DecodingError.dataCorruptedError(
                in: container,
                debugDescription: "Unexpected value."
            )
        }
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.singleValueContainer()
        switch self {
        case .astllmNodeWithSchema(let value):
            try container.encode(value)
        case .astllmNodeWithPrompt(let value):
            try container.encode(value)
        }
    }
}