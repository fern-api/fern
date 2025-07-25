public struct EchoRequest: Codable, Hashable {
    public let name: String
    public let size: Int
    public let additionalProperties: [String: JSONValue]

    public init(name: String, size: Int, additionalProperties: [String: JSONValue] = .init()) {
        self.name = name
        self.size = size
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.name = try container.decode(String.self, forKey: .name)
        self.size = try container.decode(Int.self, forKey: .size)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.name, forKey: .name)
        try container.encode(self.size, forKey: .size)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case name
        case size
    }
}