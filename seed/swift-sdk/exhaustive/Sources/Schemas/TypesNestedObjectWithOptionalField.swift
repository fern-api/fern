import Foundation

public struct TypesNestedObjectWithOptionalField: Codable, Hashable, Sendable {
    public let string: Nullable<String>?
    public let nestedObject: TypesObjectWithOptionalField?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        string: Nullable<String>? = nil,
        nestedObject: TypesObjectWithOptionalField? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.string = string
        self.nestedObject = nestedObject
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.string = try container.decodeNullableIfPresent(String.self, forKey: .string)
        self.nestedObject = try container.decodeIfPresent(TypesObjectWithOptionalField.self, forKey: .nestedObject)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encodeNullableIfPresent(self.string, forKey: .string)
        try container.encodeIfPresent(self.nestedObject, forKey: .nestedObject)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case string
        case nestedObject = "NestedObject"
    }
}