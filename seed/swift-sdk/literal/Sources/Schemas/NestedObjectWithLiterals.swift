public struct NestedObjectWithLiterals: Codable, Hashable {
    public let literal1: Any
    public let literal2: Any
    public let strProp: String
    public let additionalProperties: [String: JSONValue]

    public init(literal1: Any, literal2: Any, strProp: String, additionalProperties: [String: JSONValue] = .init()) {
        self.literal1 = literal1
        self.literal2 = literal2
        self.strProp = strProp
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.literal1 = try container.decode(Any.self, forKey: .literal1)
        self.literal2 = try container.decode(Any.self, forKey: .literal2)
        self.strProp = try container.decode(String.self, forKey: .strProp)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = try encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.literal1, forKey: .literal1)
        try container.encode(self.literal2, forKey: .literal2)
        try container.encode(self.strProp, forKey: .strProp)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case literal1
        case literal2
        case strProp
    }
}