public struct DoublyLinkedListNodeAndListValue: Codable, Hashable, Sendable {
    public let nodeId: NodeId
    public let fullList: DoublyLinkedListValue
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        nodeId: NodeId,
        fullList: DoublyLinkedListValue,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.nodeId = nodeId
        self.fullList = fullList
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.nodeId = try container.decode(NodeId.self, forKey: .nodeId)
        self.fullList = try container.decode(DoublyLinkedListValue.self, forKey: .fullList)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.nodeId, forKey: .nodeId)
        try container.encode(self.fullList, forKey: .fullList)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case nodeId
        case fullList
    }
}