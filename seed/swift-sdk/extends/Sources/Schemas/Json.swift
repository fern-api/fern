public struct Json: Codable, Hashable, Sendable {
    public let docs: String
    public let raw: String
    public let additionalProperties: [String: JSONValue]

    public init(
        docs: String,
        raw: String,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.docs = docs
        self.raw = raw
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.docs = try container.decode(String.self, forKey: .docs)
        self.raw = try container.decode(String.self, forKey: .raw)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.docs, forKey: .docs)
        try container.encode(self.raw, forKey: .raw)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case docs
        case raw
    }
}