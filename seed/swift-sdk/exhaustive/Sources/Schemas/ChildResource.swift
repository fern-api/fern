import Foundation

/// Child type that extends BaseResource and adds its own properties. When extended by another type, the dynamic IR may reorder properties differently from the Swift struct initializer.
public struct ChildResource: Codable, Hashable, Sendable {
    /// The type discriminator field
    public let type: String?
    /// A document field
    public let document: String?
    /// An extra field only in the child
    public let extra: String?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        type: String? = nil,
        document: String? = nil,
        extra: String? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.type = type
        self.document = document
        self.extra = extra
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.type = try container.decodeIfPresent(String.self, forKey: .type)
        self.document = try container.decodeIfPresent(String.self, forKey: .document)
        self.extra = try container.decodeIfPresent(String.self, forKey: .extra)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encodeIfPresent(self.type, forKey: .type)
        try container.encodeIfPresent(self.document, forKey: .document)
        try container.encodeIfPresent(self.extra, forKey: .extra)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
        case document
        case extra
    }
}