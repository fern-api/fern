public struct Response: Codable, Hashable, Sendable {
    public let metadata: [String: String]
    public let docs: String
    public let data: Movie
    public let additionalProperties: [String: JSONValue]

    public init(
        metadata: [String: String],
        docs: String,
        data: Movie,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.metadata = metadata
        self.docs = docs
        self.data = data
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.metadata = try container.decode([String: String].self, forKey: .metadata)
        self.docs = try container.decode(String.self, forKey: .docs)
        self.data = try container.decode(Movie.self, forKey: .data)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.metadata, forKey: .metadata)
        try container.encode(self.docs, forKey: .docs)
        try container.encode(self.data, forKey: .data)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case metadata
        case docs
        case data
    }
}