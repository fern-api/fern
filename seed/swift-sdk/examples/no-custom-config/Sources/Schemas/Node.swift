import Foundation

public struct Node: Codable, Hashable, Sendable {
    public let name: String
    public let nodes: Nullable<[Node]>?
    public let trees: Nullable<[Tree]>?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        name: String,
        nodes: Nullable<[Node]>? = nil,
        trees: Nullable<[Tree]>? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.name = name
        self.nodes = nodes
        self.trees = trees
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.name = try container.decode(String.self, forKey: .name)
        self.nodes = try container.decodeNullableIfPresent([Node].self, forKey: .nodes)
        self.trees = try container.decodeNullableIfPresent([Tree].self, forKey: .trees)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.name, forKey: .name)
        try container.encodeNullableIfPresent(self.nodes, forKey: .nodes)
        try container.encodeNullableIfPresent(self.trees, forKey: .trees)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case name
        case nodes
        case trees
    }
}