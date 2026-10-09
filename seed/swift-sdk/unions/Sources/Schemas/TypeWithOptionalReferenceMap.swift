import Foundation

public struct TypeWithOptionalReferenceMap: Codable, Hashable, Sendable {
    public let references: [String: Foo?]
    public let metadata: [String: JSONValue]
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        references: [String: Foo?],
        metadata: [String: JSONValue],
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.references = references
        self.metadata = metadata
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.references = try container.decode([String: Foo?].self, forKey: .references)
        self.metadata = try container.decode([String: JSONValue].self, forKey: .metadata)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.references, forKey: .references)
        try container.encode(self.metadata, forKey: .metadata)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case references
        case metadata
    }
}