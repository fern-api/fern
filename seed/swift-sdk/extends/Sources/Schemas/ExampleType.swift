public struct ExampleType: Codable, Hashable, Sendable {
    public let docs: String
    public let name: String
    public let additionalProperties: [String: JSONValue]

    public init(
        docs: String,
        name: String,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.docs = docs
        self.name = name
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.docs = try container.decode(String.self, forKey: .docs)
        self.name = try container.decode(String.self, forKey: .name)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.docs, forKey: .docs)
        try container.encode(self.name, forKey: .name)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case docs
        case name
    }
}