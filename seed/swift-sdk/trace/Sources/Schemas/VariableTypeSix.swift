import Foundation

public struct VariableTypeSix: Codable, Hashable, Sendable {
    public let keyType: VariableType
    public let valueType: VariableType
    public let type: VariableTypeSixType
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        keyType: VariableType,
        valueType: VariableType,
        type: VariableTypeSixType,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.keyType = keyType
        self.valueType = valueType
        self.type = type
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.keyType = try container.decode(VariableType.self, forKey: .keyType)
        self.valueType = try container.decode(VariableType.self, forKey: .valueType)
        self.type = try container.decode(VariableTypeSixType.self, forKey: .type)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.keyType, forKey: .keyType)
        try container.encode(self.valueType, forKey: .valueType)
        try container.encode(self.type, forKey: .type)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case keyType
        case valueType
        case type
    }
}