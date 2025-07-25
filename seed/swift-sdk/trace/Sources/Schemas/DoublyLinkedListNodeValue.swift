public struct DoublyLinkedListNodeValue: Codable, Hashable {
    public let nodeId: NodeId
    public let val: Double
    public let next: NodeId?
    public let prev: NodeId?
    public let additionalProperties: [String: JSONValue]

    public init(nodeId: NodeId, val: Double, next: NodeId? = nil, prev: NodeId? = nil, additionalProperties: [String: JSONValue] = .init()) {
        self.nodeId = nodeId
        self.val = val
        self.next = next
        self.prev = prev
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.nodeId = try container.decode(NodeId.self, forKey: .nodeId)
        self.val = try container.decode(Double.self, forKey: .val)
        self.next = try container.decodeIfPresent(NodeId.self, forKey: .next)
        self.prev = try container.decodeIfPresent(NodeId.self, forKey: .prev)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.nodeId, forKey: .nodeId)
        try container.encode(self.val, forKey: .val)
        try container.encodeIfPresent(self.next, forKey: .next)
        try container.encodeIfPresent(self.prev, forKey: .prev)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case nodeId
        case val
        case next
        case prev
    }
}