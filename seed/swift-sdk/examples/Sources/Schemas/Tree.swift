public struct Tree: Codable, Hashable, Sendable {
    public let nodes: [Node]?
    public let additionalProperties: [String: JSONValue]

    public init(
        nodes: [Node]? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.nodes = nodes
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.nodes = try container.decodeIfPresent([Node].self, forKey: .nodes)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encodeIfPresent(self.nodes, forKey: .nodes)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case nodes
    }
}