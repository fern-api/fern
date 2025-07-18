public struct Foo: Codable, Hashable {
    public let foo: Foo?
    public let additionalProperties: [String: JSONValue]

    public init(foo: Foo? = nil, additionalProperties: [String: JSONValue] = .init()) {
        self.foo = foo
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.foo = try container.decodeIfPresent(Foo.self, forKey: .foo)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = try encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encodeIfPresent(self.foo, forKey: .foo)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case foo
    }
}