import Foundation

public struct VariantA: Codable, Hashable, Sendable {
    public let type: A
    public let valueA: String
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        type: A,
        valueA: String,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.type = type
        self.valueA = valueA
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.type = try container.decode(A.self, forKey: .type)
        self.valueA = try container.decode(String.self, forKey: .valueA)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.type, forKey: .type)
        try container.encode(self.valueA, forKey: .valueA)
    }

    public enum A: String, Codable, Hashable, CaseIterable, Sendable {
        case a = "A"
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
        case valueA
    }
}