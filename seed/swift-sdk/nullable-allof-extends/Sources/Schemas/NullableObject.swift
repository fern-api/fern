import Foundation

/// This schema has nullable:true at the top level.
public struct NullableObject: Codable, Hashable, Sendable {
    public let nullableField: String?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        nullableField: String? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.nullableField = nullableField
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.nullableField = try container.decodeIfPresent(String.self, forKey: .nullableField)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encodeIfPresent(self.nullableField, forKey: .nullableField)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case nullableField
    }
}