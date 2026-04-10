import Foundation

public struct ShapeOne: Codable, Hashable, Sendable {
    public let length: Double
    public let type: ShapeOneType
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        length: Double,
        type: ShapeOneType,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.length = length
        self.type = type
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.length = try container.decode(Double.self, forKey: .length)
        self.type = try container.decode(ShapeOneType.self, forKey: .type)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.length, forKey: .length)
        try container.encode(self.type, forKey: .type)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case length
        case type
    }
}