import Foundation

public struct VariantC: Codable, Hashable, Sendable {
    public let type: C
    public let valueC: Bool
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        type: C,
        valueC: Bool,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.type = type
        self.valueC = valueC
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.type = try container.decode(C.self, forKey: .type)
        self.valueC = try container.decode(Bool.self, forKey: .valueC)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.type, forKey: .type)
        try container.encode(self.valueC, forKey: .valueC)
    }

    public enum C: String, Codable, Hashable, CaseIterable, Sendable {
        case c = "C"
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
        case valueC
    }
}