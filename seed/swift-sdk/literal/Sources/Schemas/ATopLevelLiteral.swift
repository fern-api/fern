public struct ATopLevelLiteral: Codable, Hashable {
    public let nestedLiteral: ANestedLiteral
    public let additionalProperties: [String: JSONValue]

    public init(nestedLiteral: ANestedLiteral, additionalProperties: [String: JSONValue] = .init()) {
        self.nestedLiteral = nestedLiteral
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.nestedLiteral = try container.decode(ANestedLiteral.self, forKey: .nestedLiteral)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = try encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.nestedLiteral, forKey: .nestedLiteral)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case nestedLiteral
    }
}