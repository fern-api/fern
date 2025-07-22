public struct Metadata: Codable, Hashable {
    public let id: String
    public let data: Any?
    public let jsonString: String?
    public let additionalProperties: [String: JSONValue]

    public init(id: String, data: Any? = nil, jsonString: String? = nil, additionalProperties: [String: JSONValue] = .init()) {
        self.id = id
        self.data = data
        self.jsonString = jsonString
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.id = try container.decode(String.self, forKey: .id)
        self.data = try container.decodeIfPresent(Any.self, forKey: .data)
        self.jsonString = try container.decodeIfPresent(String.self, forKey: .jsonString)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = try encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.id, forKey: .id)
        try container.encodeIfPresent(self.data, forKey: .data)
        try container.encodeIfPresent(self.jsonString, forKey: .jsonString)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case id
        case data
        case jsonString
    }
}