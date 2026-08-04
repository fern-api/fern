import Foundation

public struct Record: Codable, Hashable, Sendable {
    public let foo: [String: String]
    public let _3D: Int
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        foo: [String: String],
        _3D: Int,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.foo = foo
        self._3D = _3D
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.foo = try container.decode([String: String].self, forKey: .foo)
        self._3D = try container.decode(Int.self, forKey: ._3D)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.foo, forKey: .foo)
        try container.encode(self._3D, forKey: ._3D)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case foo
        case _3D = "3d"
    }
}