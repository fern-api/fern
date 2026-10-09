import Foundation

public struct AstllmNodeWithPrompt: Codable, Hashable, Sendable {
    public let type: AstllmNodeWithPromptType
    public let model: String
    public let prompt: String
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        type: AstllmNodeWithPromptType,
        model: String,
        prompt: String,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.type = type
        self.model = model
        self.prompt = prompt
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.type = try container.decode(AstllmNodeWithPromptType.self, forKey: .type)
        self.model = try container.decode(String.self, forKey: .model)
        self.prompt = try container.decode(String.self, forKey: .prompt)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.type, forKey: .type)
        try container.encode(self.model, forKey: .model)
        try container.encode(self.prompt, forKey: .prompt)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
        case model
        case prompt
    }
}