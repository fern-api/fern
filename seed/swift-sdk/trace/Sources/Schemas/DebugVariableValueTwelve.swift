import Foundation

public struct DebugVariableValueTwelve: Codable, Hashable, Sendable {
    public let stringifiedType: Nullable<String>?
    public let stringifiedValue: String
    public let type: DebugVariableValueTwelveType
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        stringifiedType: Nullable<String>? = nil,
        stringifiedValue: String,
        type: DebugVariableValueTwelveType,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.stringifiedType = stringifiedType
        self.stringifiedValue = stringifiedValue
        self.type = type
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.stringifiedType = try container.decodeNullableIfPresent(String.self, forKey: .stringifiedType)
        self.stringifiedValue = try container.decode(String.self, forKey: .stringifiedValue)
        self.type = try container.decode(DebugVariableValueTwelveType.self, forKey: .type)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encodeNullableIfPresent(self.stringifiedType, forKey: .stringifiedType)
        try container.encode(self.stringifiedValue, forKey: .stringifiedValue)
        try container.encode(self.type, forKey: .type)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case stringifiedType
        case stringifiedValue
        case type
    }
}