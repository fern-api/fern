public struct MyObject: Codable, Hashable, Sendable {
    public let unknown: JSONValue
    public let additionalProperties: [String: JSONValue]

    public init(
        unknown: JSONValue,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.unknown = unknown
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.unknown = try container.decode(JSONValue.self, forKey: .unknown)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.unknown, forKey: .unknown)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case unknown
    }
}