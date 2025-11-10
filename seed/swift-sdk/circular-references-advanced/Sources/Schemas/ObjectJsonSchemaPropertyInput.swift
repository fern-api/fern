import Foundation

public struct ObjectJsonSchemaPropertyInput: Codable, Hashable, Sendable {
    public let type: Object?
    public let required: [String]?
    public let description: String?
    public let properties: [String: ObjectJsonSchemaPropertyInputPropertiesValue]?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        type: Object? = nil,
        required: [String]? = nil,
        description: String? = nil,
        properties: [String: ObjectJsonSchemaPropertyInputPropertiesValue]? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.type = type
        self.required = required
        self.description = description
        self.properties = properties
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.type = try container.decodeIfPresent(Object.self, forKey: .type)
        self.required = try container.decodeIfPresent([String].self, forKey: .required)
        self.description = try container.decodeIfPresent(String.self, forKey: .description)
        self.properties = try container.decodeIfPresent([String: ObjectJsonSchemaPropertyInputPropertiesValue].self, forKey: .properties)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encodeIfPresent(self.type, forKey: .type)
        try container.encodeIfPresent(self.required, forKey: .required)
        try container.encodeIfPresent(self.description, forKey: .description)
        try container.encodeIfPresent(self.properties, forKey: .properties)
    }

    public enum Object: String, Codable, Hashable, CaseIterable, Sendable {
        case object
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
        case required
        case description
        case properties
    }
}