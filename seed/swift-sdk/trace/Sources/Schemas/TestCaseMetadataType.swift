public struct TestCaseMetadataType: Codable, Hashable, Sendable {
    public let id: TestCaseIdType
    public let name: String
    public let hidden: Bool
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        id: TestCaseIdType,
        name: String,
        hidden: Bool,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.id = id
        self.name = name
        self.hidden = hidden
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.id = try container.decode(TestCaseIdType.self, forKey: .id)
        self.name = try container.decode(String.self, forKey: .name)
        self.hidden = try container.decode(Bool.self, forKey: .hidden)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.id, forKey: .id)
        try container.encode(self.name, forKey: .name)
        try container.encode(self.hidden, forKey: .hidden)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case id
        case name
        case hidden
    }
}