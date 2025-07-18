public struct UsernamePage: Codable, Hashable {
    public let after: String?
    public let data: [String]
    public let additionalProperties: [String: JSONValue]

    public init(after: String? = nil, data: [String], additionalProperties: [String: JSONValue] = .init()) {
        self.after = after
        self.data = data
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.after = try container.decodeIfPresent(String.self, forKey: .after)
        self.data = try container.decode([String].self, forKey: .data)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = try encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encodeIfPresent(self.after, forKey: .after)
        try container.encode(self.data, forKey: .data)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case after
        case data
    }
}