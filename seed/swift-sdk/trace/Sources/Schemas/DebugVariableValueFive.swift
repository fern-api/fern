import Foundation

public struct DebugVariableValueFive: Codable, Hashable, Sendable {
    public let keyValuePairs: [DebugKeyValuePairs]
    public let type: DebugVariableValueFiveType
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        keyValuePairs: [DebugKeyValuePairs],
        type: DebugVariableValueFiveType,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.keyValuePairs = keyValuePairs
        self.type = type
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.keyValuePairs = try container.decode([DebugKeyValuePairs].self, forKey: .keyValuePairs)
        self.type = try container.decode(DebugVariableValueFiveType.self, forKey: .type)
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