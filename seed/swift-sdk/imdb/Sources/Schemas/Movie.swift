public struct Movie: Codable, Hashable {
    public let id: MovieId
    public let title: String
    public let rating: Double
    public let additionalProperties: [String: JSONValue]

    public init(id: MovieId, title: String, rating: Double, additionalProperties: [String: JSONValue] = .init()) {
        self.id = id
        self.title = title
        self.rating = rating
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.id = try container.decode(MovieId.self, forKey: .id)
        self.title = try container.decode(String.self, forKey: .title)
        self.rating = try container.decode(Double.self, forKey: .rating)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = try encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.id, forKey: .id)
        try container.encode(self.title, forKey: .title)
        try container.encode(self.rating, forKey: .rating)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case id
        case title
        case rating
    }
}