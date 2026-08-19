import Foundation

public struct LeafObjectB: Codable, Hashable, Sendable {
    public let onlyInB: String
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        onlyInB: String,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.onlyInB = onlyInB
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.onlyInB = try container.decode(String.self, forKey: .onlyInB)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.onlyInB, forKey: .onlyInB)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case onlyInB
    }
}