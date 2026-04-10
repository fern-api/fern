import Foundation

public struct VariableValueSeven: Codable, Hashable, Sendable {
    public let root: NodeId?
    public let nodes: [String: BinaryTreeNodeValue]
    public let type: VariableValueSevenType
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        root: NodeId? = nil,
        nodes: [String: BinaryTreeNodeValue],
        type: VariableValueSevenType,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.root = root
        self.nodes = nodes
        self.type = type
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.root = try container.decodeIfPresent(NodeId.self, forKey: .root)
        self.nodes = try container.decode([String: BinaryTreeNodeValue].self, forKey: .nodes)
        self.type = try container.decode(VariableValueSevenType.self, forKey: .type)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encodeIfPresent(self.root, forKey: .root)
        try container.encode(self.nodes, forKey: .nodes)
        try container.encode(self.type, forKey: .type)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case root
        case nodes
        case type
    }
}