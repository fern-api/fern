public struct BinaryTreeValue: Codable, Hashable, Sendable {
    public let root: NodeId?
    public let nodes: [NodeId: BinaryTreeNodeValue]
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        root: NodeId? = nil,
        nodes: [NodeId: BinaryTreeNodeValue],
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.root = root
        self.nodes = nodes
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.root = try container.decodeIfPresent(NodeId.self, forKey: .root)
        self.nodes = try container.decode([NodeId: BinaryTreeNodeValue].self, forKey: .nodes)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encodeIfPresent(self.root, forKey: .root)
        try container.encode(self.nodes, forKey: .nodes)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case root
        case nodes
    }
}