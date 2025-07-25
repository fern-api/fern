public struct TestCase: Codable, Hashable, Sendable {
    public let id: String
    public let params: [VariableValue]
    public let additionalProperties: [String: JSONValue]

    public init(
        id: String,
        params: [VariableValue],
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.id = id
        self.params = params
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.id = try container.decode(String.self, forKey: .id)
        self.params = try container.decode([VariableValue].self, forKey: .params)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.id, forKey: .id)
        try container.encode(self.params, forKey: .params)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case id
        case params
    }
}