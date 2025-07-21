public struct RootType: Codable, Hashable {
    public let s: String
    public let additionalProperties: [String: JSONValue]

    public init(s: String, additionalProperties: [String: JSONValue] = .init()) {
        self.s = s
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.s = try container.decode(String.self, forKey: .s)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = try encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.s, forKey: .s)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case s
    }
}