import Foundation

/// An object with typed embedding properties. Tests that construct_type
/// handles non-mapping data gracefully when the expected type is an object.
public struct EmbeddingsResponse: Codable, Hashable, Sendable {
    public let embeddings: EmbeddingsByModel
    public let texts: [String]?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        embeddings: EmbeddingsByModel,
        texts: [String]? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.embeddings = embeddings
        self.texts = texts
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.embeddings = try container.decode(EmbeddingsByModel.self, forKey: .embeddings)
        self.texts = try container.decodeIfPresent([String].self, forKey: .texts)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.embeddings, forKey: .embeddings)
        try container.encodeIfPresent(self.texts, forKey: .texts)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case embeddings
        case texts
    }
}