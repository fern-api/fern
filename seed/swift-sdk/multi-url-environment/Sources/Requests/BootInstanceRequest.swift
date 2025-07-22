public struct BootInstanceRequest: Codable, Hashable {
    public let size: String
    public let additionalProperties: [String: JSONValue]

    public init(size: String, additionalProperties: [String: JSONValue] = .init()) {
        self.size = size
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.size = try container.decode(String.self, forKey: .size)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = try encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.size, forKey: .size)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case size
    }
}