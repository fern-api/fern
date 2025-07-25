public struct BranchNode: Codable, Hashable {
    public let children: [Node]
    public let additionalProperties: [String: JSONValue]

    public init(children: [Node], additionalProperties: [String: JSONValue] = .init()) {
        self.children = children
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.children = try container.decode([Node].self, forKey: .children)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.children, forKey: .children)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case children
    }
}