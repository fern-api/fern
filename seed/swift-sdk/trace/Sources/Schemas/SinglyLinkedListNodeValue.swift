public struct SinglyLinkedListNodeValue: Codable, Hashable, Sendable {
    public let nodeId: NodeId
    public let val: Double
    public let next: NodeId?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        nodeId: NodeId,
        val: Double,
        next: NodeId? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.nodeId = nodeId
        self.val = val
        self.next = next
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.nodeId = try container.decode(NodeId.self, forKey: .nodeId)
        self.val = try container.decode(Double.self, forKey: .val)
        self.next = try container.decodeIfPresent(NodeId.self, forKey: .next)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.nodeId, forKey: .nodeId)
        try container.encode(self.val, forKey: .val)
        try container.encodeIfPresent(self.next, forKey: .next)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case nodeId
        case val
        case next
    }
}