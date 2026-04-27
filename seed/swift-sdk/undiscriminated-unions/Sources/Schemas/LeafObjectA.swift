import Foundation

public struct LeafObjectA: Codable, Hashable, Sendable {
    public let onlyInA: String
    public let sharedNumber: Int
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        onlyInA: String,
        sharedNumber: Int,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.onlyInA = onlyInA
        self.sharedNumber = sharedNumber
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.onlyInA = try container.decode(String.self, forKey: .onlyInA)
        self.sharedNumber = try container.decode(Int.self, forKey: .sharedNumber)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.onlyInA, forKey: .onlyInA)
        try container.encode(self.sharedNumber, forKey: .sharedNumber)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case onlyInA
        case sharedNumber
    }
}