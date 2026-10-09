import Foundation

public struct AstNodeLlm: Codable, Hashable, Sendable {
    public let model: String
    public let valueSchema: [String: JSONValue]?
    public let prompt: String?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        model: String,
        valueSchema: [String: JSONValue]? = nil,
        prompt: String? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.model = model
        self.valueSchema = valueSchema
        self.prompt = prompt
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.model = try container.decode(String.self, forKey: .model)
        self.valueSchema = try container.decodeIfPresent([String: JSONValue].self, forKey: .valueSchema)
        self.prompt = try container.decodeIfPresent(String.self, forKey: .prompt)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.model, forKey: .model)
        try container.encodeIfPresent(self.valueSchema, forKey: .valueSchema)
        try container.encodeIfPresent(self.prompt, forKey: .prompt)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case model
        case valueSchema = "value_schema"
        case prompt
    }
}