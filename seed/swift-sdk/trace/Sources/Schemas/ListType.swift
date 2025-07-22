public struct ListType: Codable, Hashable {
    public let valueType: VariableType
    public let isFixedLength: Bool?
    public let additionalProperties: [String: JSONValue]

    public init(valueType: VariableType, isFixedLength: Bool? = nil, additionalProperties: [String: JSONValue] = .init()) {
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
        var container = try encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.valueType, forKey: .valueType)
        try container.encodeIfPresent(self.isFixedLength, forKey: .isFixedLength)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case valueType
        case isFixedLength
    }
}