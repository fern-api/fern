import Foundation

public struct UnionWithSubTypesOne: Codable, Hashable, Sendable {
    public let age: Int
    public let name: String
    public let type: UnionWithSubTypesOneType
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        age: Int,
        name: String,
        type: UnionWithSubTypesOneType,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.age = age
        self.name = name
        self.type = type
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.age = try container.decode(Int.self, forKey: .age)
        self.name = try container.decode(String.self, forKey: .name)
        self.type = try container.decode(UnionWithSubTypesOneType.self, forKey: .type)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.age, forKey: .age)
        try container.encode(self.name, forKey: .name)
        try container.encode(self.type, forKey: .type)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case age
        case name
        case type
    }
}