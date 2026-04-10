import Foundation

public struct VariableValueEight: Codable, Hashable, Sendable {
    public let head: NodeId?
    public let nodes: [String: SinglyLinkedListNodeValue]
    public let type: VariableValueEightType
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        head: NodeId? = nil,
        nodes: [String: SinglyLinkedListNodeValue],
        type: VariableValueEightType,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.head = head
        self.nodes = nodes
        self.type = type
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.head = try container.decodeIfPresent(NodeId.self, forKey: .head)
        self.nodes = try container.decode([String: SinglyLinkedListNodeValue].self, forKey: .nodes)
        self.type = try container.decode(VariableValueEightType.self, forKey: .type)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encodeIfPresent(self.head, forKey: .head)
        try container.encode(self.nodes, forKey: .nodes)
        try container.encode(self.type, forKey: .type)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case head
        case nodes
        case type
    }
}