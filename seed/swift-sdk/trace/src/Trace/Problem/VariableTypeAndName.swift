public struct VariableTypeAndName: Codable, Hashable {
    public let variableType: VariableType
    public let name: String
    public let additionalProperties: [String: JSONValue]

    public init(variableType: VariableType, name: String, additionalProperties: [String: JSONValue] = .init()) {
        self.variableType = variableType
        self.name = name
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.variableType = try container.decode(VariableType.self, forKey: .variableType)
        self.name = try container.decode(String.self, forKey: .name)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = try encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.variableType, forKey: .variableType)
        try container.encode(self.name, forKey: .name)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case variableType
        case name
    }
}