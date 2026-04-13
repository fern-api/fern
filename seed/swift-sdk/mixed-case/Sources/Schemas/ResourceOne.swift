import Foundation

public struct ResourceOne: Codable, Hashable, Sendable {
    public let name: String
    public let resourceType: ResourceOneResourceType
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        name: String,
        resourceType: ResourceOneResourceType,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.name = name
        self.resourceType = resourceType
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.name = try container.decode(String.self, forKey: .name)
        self.resourceType = try container.decode(ResourceOneResourceType.self, forKey: .resourceType)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.name, forKey: .name)
        try container.encode(self.resourceType, forKey: .resourceType)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case name
        case resourceType = "resource_type"
    }
}