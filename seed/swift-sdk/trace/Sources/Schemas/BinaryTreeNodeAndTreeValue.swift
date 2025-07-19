public struct BinaryTreeNodeAndTreeValue: Codable, Hashable {
    public let nodeId: NodeId
    public let fullTree: BinaryTreeValue
    public let additionalProperties: [String: JSONValue]

    public init(nodeId: NodeId, fullTree: BinaryTreeValue, additionalProperties: [String: JSONValue] = .init()) {
        self.nodeId = nodeId
        self.fullTree = fullTree
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.nodeId = try container.decode(NodeId.self, forKey: .nodeId)
        self.fullTree = try container.decode(BinaryTreeValue.self, forKey: .fullTree)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = try encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.nodeId, forKey: .nodeId)
        try container.encode(self.fullTree, forKey: .fullTree)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case nodeId
        case fullTree
    }
}