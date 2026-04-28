import Foundation

public struct CatalogImage: Codable, Hashable, Sendable {
    public let id: String
    public let caption: String?
    public let url: String?
    public let createRequest: CreateCatalogImageRequest?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        id: String,
        caption: String? = nil,
        url: String? = nil,
        createRequest: CreateCatalogImageRequest? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.id = id
        self.caption = caption
        self.url = url
        self.createRequest = createRequest
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.id = try container.decode(String.self, forKey: .id)
        self.caption = try container.decodeIfPresent(String.self, forKey: .caption)
        self.url = try container.decodeIfPresent(String.self, forKey: .url)
        self.createRequest = try container.decodeIfPresent(CreateCatalogImageRequest.self, forKey: .createRequest)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.id, forKey: .id)
        try container.encodeIfPresent(self.caption, forKey: .caption)
        try container.encodeIfPresent(self.url, forKey: .url)
        try container.encodeIfPresent(self.createRequest, forKey: .createRequest)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case id
        case caption
        case url
        case createRequest = "create_request"
    }
}