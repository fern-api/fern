public struct Pet: Codable, Hashable {
    public let category: Category?
    public let id: Int64?
    public let name: String
    public let photoUrls: [String]
    public let status: PetStatus?
    public let tags: [Tag]?
    public let additionalProperties: [String: JSONValue]

    public init(category: Category? = nil, id: Int64? = nil, name: String, photoUrls: [String], status: PetStatus? = nil, tags: [Tag]? = nil, additionalProperties: [String: JSONValue] = .init()) {
        self.category = category
        self.id = id
        self.name = name
        self.photoUrls = photoUrls
        self.status = status
        self.tags = tags
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.category = try container.decodeIfPresent(Category.self, forKey: .category)
        self.id = try container.decodeIfPresent(Int64.self, forKey: .id)
        self.name = try container.decode(String.self, forKey: .name)
        self.photoUrls = try container.decode([String].self, forKey: .photoUrls)
        self.status = try container.decodeIfPresent(PetStatus.self, forKey: .status)
        self.tags = try container.decodeIfPresent([Tag].self, forKey: .tags)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = try encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encodeIfPresent(self.category, forKey: .category)
        try container.encodeIfPresent(self.id, forKey: .id)
        try container.encode(self.name, forKey: .name)
        try container.encode(self.photoUrls, forKey: .photoUrls)
        try container.encodeIfPresent(self.status, forKey: .status)
        try container.encodeIfPresent(self.tags, forKey: .tags)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case category
        case id
        case name
        case photoUrls
        case status
        case tags
    }
}