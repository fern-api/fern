public struct ObjectWithMapOfMap: Codable, Hashable, Sendable {
    public let map: [String: [String: String]]
    public let additionalProperties: [String: JSONValue]

    public init(
        map: [String: [String: String]],
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.map = map
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.map = try container.decode([String: [String: String]].self, forKey: .map)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.map, forKey: .map)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case map
    }
}