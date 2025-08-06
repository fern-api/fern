public struct NestedObjectWithLiterals: Codable, Hashable, Sendable {
    public let literal1: JSONValue
    public let literal2: JSONValue
    public let strProp: String
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        literal1: JSONValue,
        literal2: JSONValue,
        strProp: String,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.literal1 = literal1
        self.literal2 = literal2
        self.strProp = strProp
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.literal1 = try container.decode(JSONValue.self, forKey: .literal1)
        self.literal2 = try container.decode(JSONValue.self, forKey: .literal2)
        self.strProp = try container.decode(String.self, forKey: .strProp)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
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