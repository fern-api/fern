public struct NodesWrapper: Codable, Hashable {
    public let nodes: [[Node]]
    public let additionalProperties: [String: JSONValue]

    public init(nodes: [[Node]], additionalProperties: [String: JSONValue] = .init()) {
        self.nodes = nodes
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.nodes = try container.decode([[Node]].self, forKey: .nodes)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = try encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.nodes, forKey: .nodes)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case nodes
    }
}