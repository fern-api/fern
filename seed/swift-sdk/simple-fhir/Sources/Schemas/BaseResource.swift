public struct BaseResource: Codable, Hashable, Sendable {
    public let id: String
    public let relatedResources: [ResourceList]
    public let memo: Memo
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        id: String,
        relatedResources: [ResourceList],
        memo: Memo,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.id = id
        self.relatedResources = relatedResources
        self.memo = memo
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.id = try container.decode(String.self, forKey: .id)
        self.relatedResources = try container.decode([ResourceList].self, forKey: .relatedResources)
        self.memo = try container.decode(Memo.self, forKey: .memo)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.id, forKey: .id)
        try container.encode(self.relatedResources, forKey: .relatedResources)
        try container.encode(self.memo, forKey: .memo)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case id
        case relatedResources = "related_resources"
        case memo
    }
}