public struct Circle: Codable, Hashable {
    public let radius: Double
    public let additionalProperties: [String: JSONValue]

    public init(radius: Double, additionalProperties: [String: JSONValue] = .init()) {
        self.radius = radius
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.radius = try container.decode(Double.self, forKey: .radius)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = try encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.radius, forKey: .radius)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case radius
    }
}