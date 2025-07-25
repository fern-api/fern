public struct Square: Codable, Hashable {
    public let length: Double
    public let additionalProperties: [String: JSONValue]

    public init(
        length: Double,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.length = length
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.length = try container.decode(Double.self, forKey: .length)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.length, forKey: .length)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case length
    }
}