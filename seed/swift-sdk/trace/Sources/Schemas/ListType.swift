import Foundation

public struct ListType: Codable, Hashable, Sendable {
    public let valueType: VariableType
    /// Whether this list is fixed-size (for languages that supports fixed-size lists). Defaults to false.
    public let isFixedLength: Bool?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        valueType: VariableType,
        isFixedLength: Bool? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.valueType = valueType
        self.isFixedLength = isFixedLength
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.valueType = try container.decode(VariableType.self, forKey: .valueType)
        self.isFixedLength = try container.decodeIfPresent(Bool.self, forKey: .isFixedLength)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.valueType, forKey: .valueType)
        try container.encodeIfPresent(self.isFixedLength, forKey: .isFixedLength)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case valueType
        case isFixedLength
    }
}