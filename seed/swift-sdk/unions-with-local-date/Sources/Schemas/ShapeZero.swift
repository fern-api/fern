import Foundation

public struct ShapeZero: Codable, Hashable, Sendable {
    public let radius: Double
    public let type: ShapeZeroType
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        radius: Double,
        type: ShapeZeroType,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.radius = radius
        self.type = type
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.radius = try container.decode(Double.self, forKey: .radius)
        self.type = try container.decode(ShapeZeroType.self, forKey: .type)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.radius, forKey: .radius)
        try container.encode(self.type, forKey: .type)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case radius
        case type
    }
}