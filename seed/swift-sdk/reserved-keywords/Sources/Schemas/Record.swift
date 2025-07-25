public struct Record: Codable, Hashable {
    public let foo: [String: String]
    public let 3D: Int
    public let additionalProperties: [String: JSONValue]

    public init(
        foo: [String: String],
        3D: Int,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.foo = foo
        self.3D = 3D
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.foo = try container.decode([String: String].self, forKey: .foo)
        self.3D = try container.decode(Int.self, forKey: .3D)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.foo, forKey: .foo)
        try container.encode(self.3D, forKey: .3D)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case foo
        case 3D = "3d"
    }
}