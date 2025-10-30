import Foundation

public struct VariantB: Codable, Hashable, Sendable {
    public let type: B
    public let valueB: Int
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        type: B,
        valueB: Int,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.type = type
        self.valueB = valueB
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.type = try container.decode(B.self, forKey: .type)
        self.valueB = try container.decode(Int.self, forKey: .valueB)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.type, forKey: .type)
        try container.encode(self.valueB, forKey: .valueB)
    }

    public enum B: String, Codable, Hashable, CaseIterable, Sendable {
        case b = "B"
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
        case valueB
    }
}