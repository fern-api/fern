public struct HarmoniousPlay: Codable, Hashable {
    public let value: String
    public let additionalProperties: [String: JSONValue]

    public init(value: String, additionalProperties: [String: JSONValue] = .init()) {
        self.value = value
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.value = try container.decode(String.self, forKey: .value)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = try encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.value, forKey: .value)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case value
    }
}