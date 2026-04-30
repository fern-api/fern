import Foundation

public struct CreateCatalogImageRequest: Codable, Hashable, Sendable {
    public let caption: String?
    public let catalogObjectId: String
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        caption: String? = nil,
        catalogObjectId: String,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.caption = caption
        self.catalogObjectId = catalogObjectId
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.caption = try container.decodeIfPresent(String.self, forKey: .caption)
        self.catalogObjectId = try container.decode(String.self, forKey: .catalogObjectId)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encodeIfPresent(self.caption, forKey: .caption)
        try container.encode(self.catalogObjectId, forKey: .catalogObjectId)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case caption
        case catalogObjectId = "catalog_object_id"
    }
}