import Foundation

public struct VariableValueFive: Codable, Hashable, Sendable {
    public let keyValuePairs: [KeyValuePair]
    public let type: VariableValueFiveType
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        keyValuePairs: [KeyValuePair],
        type: VariableValueFiveType,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.keyValuePairs = keyValuePairs
        self.type = type
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.keyValuePairs = try container.decode([KeyValuePair].self, forKey: .keyValuePairs)
        self.type = try container.decode(VariableValueFiveType.self, forKey: .type)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.keyValuePairs, forKey: .keyValuePairs)
        try container.encode(self.type, forKey: .type)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case keyValuePairs
        case type
    }
}