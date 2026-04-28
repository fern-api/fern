import Foundation

public struct WrapperObject: Codable, Hashable, Sendable {
    public let inner: NestedObjectUnion
    public let label: String
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        inner: NestedObjectUnion,
        label: String,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.inner = inner
        self.label = label
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.inner = try container.decode(NestedObjectUnion.self, forKey: .inner)
        self.label = try container.decode(String.self, forKey: .label)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.inner, forKey: .inner)
        try container.encode(self.label, forKey: .label)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case inner
        case label
    }
}