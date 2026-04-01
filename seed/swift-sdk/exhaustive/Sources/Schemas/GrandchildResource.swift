import Foundation

/// Grandchild type used to make ChildResource an "extended" type, triggering different property ordering in the dynamic IR.
public struct GrandchildResource: Codable, Hashable, Sendable {
    /// An extra field only in the child
    public let extra: String?
    /// The type discriminator field
    public let type: String?
    /// A document field
    public let document: String?
    /// A field only in the grandchild
    public let anotherExtra: String?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        extra: String? = nil,
        type: String? = nil,
        document: String? = nil,
        anotherExtra: String? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.extra = extra
        self.type = type
        self.document = document
        self.anotherExtra = anotherExtra
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.extra = try container.decodeIfPresent(String.self, forKey: .extra)
        self.type = try container.decodeIfPresent(String.self, forKey: .type)
        self.document = try container.decodeIfPresent(String.self, forKey: .document)
        self.anotherExtra = try container.decodeIfPresent(String.self, forKey: .anotherExtra)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encodeIfPresent(self.extra, forKey: .extra)
        try container.encodeIfPresent(self.type, forKey: .type)
        try container.encodeIfPresent(self.document, forKey: .document)
        try container.encodeIfPresent(self.anotherExtra, forKey: .anotherExtra)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case extra
        case type
        case document
        case anotherExtra
    }
}