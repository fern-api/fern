public struct Node: Codable, Hashable {
    public let name: String
    public let nodes: [Node]?
    public let trees: [Tree]?
    public let additionalProperties: [String: JSONValue]

    public init(name: String, nodes: [Node]? = nil, trees: [Tree]? = nil, additionalProperties: [String: JSONValue] = .init()) {
        self.name = name
        self.nodes = nodes
        self.trees = trees
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.name = try container.decode(String.self, forKey: .name)
        self.nodes = try container.decodeIfPresent([Node].self, forKey: .nodes)
        self.trees = try container.decodeIfPresent([Tree].self, forKey: .trees)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.name, forKey: .name)
        try container.encodeIfPresent(self.nodes, forKey: .nodes)
        try container.encodeIfPresent(self.trees, forKey: .trees)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case name
        case nodes
        case trees
    }
}