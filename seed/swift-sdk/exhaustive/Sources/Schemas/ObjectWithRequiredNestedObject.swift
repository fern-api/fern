import Foundation

/// Tests that dynamic snippets recursively construct default objects for
/// required properties whose type is a named object. The nested object's
/// own required properties should also be filled with defaults.
public struct ObjectWithRequiredNestedObject: Codable, Hashable, Sendable {
    public let requiredString: String
    public let requiredObject: NestedObjectWithRequiredField
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        requiredString: String,
        requiredObject: NestedObjectWithRequiredField,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.requiredString = requiredString
        self.requiredObject = requiredObject
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.requiredString = try container.decode(String.self, forKey: .requiredString)
        self.requiredObject = try container.decode(NestedObjectWithRequiredField.self, forKey: .requiredObject)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.requiredString, forKey: .requiredString)
        try container.encode(self.requiredObject, forKey: .requiredObject)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case requiredString
        case requiredObject
    }
}