public struct User: Codable, Hashable {
    public let userName: String
    public let metadataTags: [String]
    public let extraProperties: Any
    public let additionalProperties: [String: JSONValue]

    public init(userName: String, metadataTags: [String], extraProperties: Any, additionalProperties: [String: JSONValue] = .init()) {
        self.userName = userName
        self.metadataTags = metadataTags
        self.extraProperties = extraProperties
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.userName = try container.decode(String.self, forKey: .userName)
        self.metadataTags = try container.decode([String].self, forKey: .metadataTags)
        self.extraProperties = try container.decode(Any.self, forKey: .extraProperties)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = try encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.userName, forKey: .userName)
        try container.encode(self.metadataTags, forKey: .metadataTags)
        try container.encode(self.extraProperties, forKey: .extraProperties)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case userName
        case metadataTags = "metadata_tags"
        case extraProperties = "EXTRA_PROPERTIES"
    }
}