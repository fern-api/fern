import Foundation

/// Tests that unknown types are able to preserve their type names.
public struct ObjectWithDocumentedUnknownType: Codable, Hashable, Sendable {
    public let documentedUnknownType: DocumentedUnknownType
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        documentedUnknownType: DocumentedUnknownType,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.documentedUnknownType = documentedUnknownType
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.documentedUnknownType = try container.decode(DocumentedUnknownType.self, forKey: .documentedUnknownType)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.documentedUnknownType, forKey: .documentedUnknownType)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case documentedUnknownType
    }
}