import Foundation

public struct AstllmNodeWithSchema: Codable, Hashable, Sendable {
    public let type: AstllmNodeWithSchemaType
    public let model: String
    public let valueSchema: [String: JSONValue]
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        type: AstllmNodeWithSchemaType,
        model: String,
        valueSchema: [String: JSONValue],
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.type = type
        self.model = model
        self.valueSchema = valueSchema
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.type = try container.decode(AstllmNodeWithSchemaType.self, forKey: .type)
        self.model = try container.decode(String.self, forKey: .model)
        self.valueSchema = try container.decode([String: JSONValue].self, forKey: .valueSchema)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.type, forKey: .type)
        try container.encode(self.model, forKey: .model)
        try container.encode(self.valueSchema, forKey: .valueSchema)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
        case model
        case valueSchema = "value_schema"
    }
}