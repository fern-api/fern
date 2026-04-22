import Foundation

public struct MapType: Codable, Hashable, Sendable {
    public let keyType: VariableType
    public let valueType: VariableType
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        keyType: VariableType,
        valueType: VariableType,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.keyType = keyType
        self.valueType = valueType
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.keyType = try container.decode(VariableType.self, forKey: .keyType)
        self.valueType = try container.decode(VariableType.self, forKey: .valueType)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.keyType, forKey: .keyType)
        try container.encode(self.valueType, forKey: .valueType)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case keyType
        case valueType
    }
}