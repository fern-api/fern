import Foundation

public struct TreeDescribable: Codable, Hashable, Sendable {
    /// Display name of the tree.
    public let treeName: String?
    /// A description of the tree.
    public let treeDescription: String?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        treeName: String? = nil,
        treeDescription: String? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.treeName = treeName
        self.treeDescription = treeDescription
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.treeName = try container.decodeIfPresent(String.self, forKey: .treeName)
        self.treeDescription = try container.decodeIfPresent(String.self, forKey: .treeDescription)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encodeIfPresent(self.treeName, forKey: .treeName)
        try container.encodeIfPresent(self.treeDescription, forKey: .treeDescription)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case treeName
        case treeDescription
    }
}