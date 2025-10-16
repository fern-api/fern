import Foundation

/// Defines properties with default values and validation rules.
public struct Type: Codable, Hashable, Sendable {
    public let decimal: Swift.Double
    public let even: Int
    public let name: String
    public let shape: Shape
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        decimal: Swift.Double,
        even: Int,
        name: String,
        shape: Shape,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.decimal = decimal
        self.even = even
        self.name = name
        self.shape = shape
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.decimal = try container.decode(Swift.Double.self, forKey: .decimal)
        self.even = try container.decode(Int.self, forKey: .even)
        self.name = try container.decode(String.self, forKey: .name)
        self.shape = try container.decode(Shape.self, forKey: .shape)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.decimal, forKey: .decimal)
        try container.encode(self.even, forKey: .even)
        try container.encode(self.name, forKey: .name)
        try container.encode(self.shape, forKey: .shape)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case decimal
        case even
        case name
        case shape
    }
}