public struct DoublyLinkedListValue: Codable, Hashable {
    public let head: NodeId?
    public let nodes: [NodeId: DoublyLinkedListNodeValue]
    public let additionalProperties: [String: JSONValue]

    public init(
        head: NodeId? = nil,
        nodes: [NodeId: DoublyLinkedListNodeValue],
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.head = head
        self.nodes = nodes
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.head = try container.decodeIfPresent(NodeId.self, forKey: .head)
        self.nodes = try container.decode([NodeId: DoublyLinkedListNodeValue].self, forKey: .nodes)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encodeIfPresent(self.head, forKey: .head)
        try container.encode(self.nodes, forKey: .nodes)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case head
        case nodes
    }
}