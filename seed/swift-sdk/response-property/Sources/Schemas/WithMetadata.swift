public struct WithMetadata: Codable, Hashable {
    public let metadata: [String: String]
    public let additionalProperties: [String: JSONValue]

    public init(
        metadata: [String: String],
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.metadata = metadata
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.metadata = try container.decode([String: String].self, forKey: .metadata)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.metadata, forKey: .metadata)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case metadata
    }
}