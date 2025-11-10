import Foundation

public struct ArrayJsonSchemaPropertyInput: Codable, Hashable, Sendable {
    public let type: Array?
    public let description: String?
    public let items: ArrayJsonSchemaPropertyInputItems
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        type: Array? = nil,
        description: String? = nil,
        items: ArrayJsonSchemaPropertyInputItems,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.type = type
        self.description = description
        self.items = items
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.type = try container.decodeIfPresent(Array.self, forKey: .type)
        self.description = try container.decodeIfPresent(String.self, forKey: .description)
        self.items = try container.decode(ArrayJsonSchemaPropertyInputItems.self, forKey: .items)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encodeIfPresent(self.type, forKey: .type)
        try container.encodeIfPresent(self.description, forKey: .description)
        try container.encode(self.items, forKey: .items)
    }

    public enum Array: String, Codable, Hashable, CaseIterable, Sendable {
        case array
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
        case description
        case items
    }
}