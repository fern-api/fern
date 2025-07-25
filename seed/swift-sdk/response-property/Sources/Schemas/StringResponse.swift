public struct StringResponse: Codable, Hashable {
    public let data: String
    public let additionalProperties: [String: JSONValue]

    public init(
        data: String,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.data = data
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.data = try container.decode(String.self, forKey: .data)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.data, forKey: .data)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case data
    }
}