public struct CreateUserRequest: Codable, Hashable {
    public let type: Any
    public let version: Any
    public let name: String
    public let additionalProperties: [String: JSONValue]

    public init(type: Any, version: Any, name: String, additionalProperties: [String: JSONValue] = .init()) {
        self.type = type
        self.version = version
        self.name = name
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.type = try container.decode(Any.self, forKey: .type)
        self.version = try container.decode(Any.self, forKey: .version)
        self.name = try container.decode(String.self, forKey: .name)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = try encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.type, forKey: .type)
        try container.encode(self.version, forKey: .version)
        try container.encode(self.name, forKey: .name)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type = "_type"
        case version = "_version"
        case name
    }
}