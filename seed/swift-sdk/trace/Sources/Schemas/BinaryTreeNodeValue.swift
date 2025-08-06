public struct BinaryTreeNodeValue: Codable, Hashable, Sendable {
    public let nodeId: NodeId
    public let val: Double
    public let right: NodeId?
    public let left: NodeId?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        nodeId: NodeId,
        val: Double,
        right: NodeId? = nil,
        left: NodeId? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.nodeId = nodeId
        self.val = val
        self.right = right
        self.left = left
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.nodeId = try container.decode(NodeId.self, forKey: .nodeId)
        self.val = try container.decode(Double.self, forKey: .val)
        self.right = try container.decodeIfPresent(NodeId.self, forKey: .right)
        self.left = try container.decodeIfPresent(NodeId.self, forKey: .left)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.nodeId, forKey: .nodeId)
        try container.encode(self.val, forKey: .val)
        try container.encodeIfPresent(self.right, forKey: .right)
        try container.encodeIfPresent(self.left, forKey: .left)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case nodeId
        case val
        case right
        case left
    }
}