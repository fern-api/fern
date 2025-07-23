public struct StreamCompletionRequest: Codable, Hashable {
    public let query: String
    public let additionalProperties: [String: JSONValue]

    public init(query: String, additionalProperties: [String: JSONValue] = .init()) {
        self.query = query
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.query = try container.decode(String.self, forKey: .query)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = try encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.query, forKey: .query)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case query
    }
}