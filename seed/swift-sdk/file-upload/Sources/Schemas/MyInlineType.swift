public struct MyInlineType: Codable, Hashable, Sendable {
    public let bar: String
    public let additionalProperties: [String: JSONValue]

    public init(
        bar: String,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.bar = bar
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.bar = try container.decode(String.self, forKey: .bar)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.bar, forKey: .bar)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case bar
    }
}