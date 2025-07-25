public struct ANestedLiteral: Codable, Hashable, Sendable {
    public let myLiteral: Any
    public let additionalProperties: [String: JSONValue]

    public init(
        myLiteral: Any,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.myLiteral = myLiteral
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.myLiteral = try container.decode(Any.self, forKey: .myLiteral)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.myLiteral, forKey: .myLiteral)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case myLiteral
    }
}