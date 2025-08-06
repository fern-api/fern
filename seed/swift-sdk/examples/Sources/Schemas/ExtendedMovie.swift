public struct ExtendedMovie: Codable, Hashable, Sendable {
    public let id: MovieId
    public let prequel: MovieId?
    public let title: String
    public let from: String
    /// The rating scale is one to five stars
    public let rating: Double
    public let type: JSONValue
    public let tag: Tag
    public let book: String?
    public let metadata: [String: JSONValue]
    public let revenue: Int64
    public let cast: [String]
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        id: MovieId,
        prequel: MovieId? = nil,
        title: String,
        from: String,
        rating: Double,
        type: JSONValue,
        tag: Tag,
        book: String? = nil,
        metadata: [String: JSONValue],
        revenue: Int64,
        cast: [String],
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.id = id
        self.prequel = prequel
        self.title = title
        self.from = from
        self.rating = rating
        self.type = type
        self.tag = tag
        self.book = book
        self.metadata = metadata
        self.revenue = revenue
        self.cast = cast
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.id = try container.decode(MovieId.self, forKey: .id)
        self.prequel = try container.decodeIfPresent(MovieId.self, forKey: .prequel)
        self.title = try container.decode(String.self, forKey: .title)
        self.from = try container.decode(String.self, forKey: .from)
        self.rating = try container.decode(Double.self, forKey: .rating)
        self.type = try container.decode(JSONValue.self, forKey: .type)
        self.tag = try container.decode(Tag.self, forKey: .tag)
        self.book = try container.decodeIfPresent(String.self, forKey: .book)
        self.metadata = try container.decode([String: JSONValue].self, forKey: .metadata)
        self.revenue = try container.decode(Int64.self, forKey: .revenue)
        self.cast = try container.decode([String].self, forKey: .cast)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.id, forKey: .id)
        try container.encodeIfPresent(self.prequel, forKey: .prequel)
        try container.encode(self.title, forKey: .title)
        try container.encode(self.from, forKey: .from)
        try container.encode(self.rating, forKey: .rating)
        try container.encode(self.type, forKey: .type)
        try container.encode(self.tag, forKey: .tag)
        try container.encodeIfPresent(self.book, forKey: .book)
        try container.encode(self.metadata, forKey: .metadata)
        try container.encode(self.revenue, forKey: .revenue)
        try container.encode(self.cast, forKey: .cast)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case id
        case prequel
        case title
        case from
        case rating
        case type
        case tag
        case book
        case metadata
        case revenue
        case cast
    }
}