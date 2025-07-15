public struct User: Codable, Hashable {
    public let userName: String
    public let metadataTags: [String]
    public let extraProperties: Any

    enum CodingKeys: String, CodingKey {
        case userName
        case metadataTags = "metadata_tags"
        case extraProperties = "EXTRA_PROPERTIES"
    }
}