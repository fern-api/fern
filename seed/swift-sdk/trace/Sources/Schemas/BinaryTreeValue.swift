public struct BinaryTreeValue: Codable, Hashable {
    public let root: NodeId?
    public let nodes: Any
    public let additionalProperties: [String: JSONValue]

    public init(
        root: NodeId? = nil,
        nodes: Any,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.root = root
        self.nodes = nodes
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.root = try container.decodeIfPresent(NodeId.self, forKey: .root)
        self.nodes = try container.decode(Any.self, forKey: .nodes)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encodeIfPresent(self.root, forKey: .root)
        try container.encode(self.nodes, forKey: .nodes)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case root
        case nodes
    }
}