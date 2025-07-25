public struct Response: Codable, Hashable, Sendable {
    public let foo: String
    public let additionalProperties: [String: JSONValue]

    public init(
        foo: String,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.foo = foo
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.foo = try container.decode(String.self, forKey: .foo)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.foo, forKey: .foo)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case foo
    }
}