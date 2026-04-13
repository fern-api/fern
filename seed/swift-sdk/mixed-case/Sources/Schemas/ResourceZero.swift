import Foundation

public struct ResourceZero: Codable, Hashable, Sendable {
    public let userName: String
    public let metadataTags: [String]
    public let extraProperties: [String: String]
    public let resourceType: ResourceZeroResourceType
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        userName: String,
        metadataTags: [String],
        extraProperties: [String: String],
        resourceType: ResourceZeroResourceType,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.userName = userName
        self.metadataTags = metadataTags
        self.extraProperties = extraProperties
        self.resourceType = resourceType
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.userName = try container.decode(String.self, forKey: .userName)
        self.metadataTags = try container.decode([String].self, forKey: .metadataTags)
        self.extraProperties = try container.decode([String: String].self, forKey: .extraProperties)
        self.resourceType = try container.decode(ResourceZeroResourceType.self, forKey: .resourceType)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.userName, forKey: .userName)
        try container.encode(self.metadataTags, forKey: .metadataTags)
        try container.encode(self.extraProperties, forKey: .extraProperties)
        try container.encode(self.resourceType, forKey: .resourceType)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case userName
        case metadataTags = "metadata_tags"
        case extraProperties = "EXTRA_PROPERTIES"
        case resourceType = "resource_type"
    }
}