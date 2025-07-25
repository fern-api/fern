public struct DebugMapValue: Codable, Hashable {
    public let keyValuePairs: [DebugKeyValuePairs]
    public let additionalProperties: [String: JSONValue]

    public init(
        keyValuePairs: [DebugKeyValuePairs],
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.keyValuePairs = keyValuePairs
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.keyValuePairs = try container.decode([DebugKeyValuePairs].self, forKey: .keyValuePairs)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.keyValuePairs, forKey: .keyValuePairs)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case keyValuePairs
    }
}