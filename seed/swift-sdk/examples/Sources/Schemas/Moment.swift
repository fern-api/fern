public struct Moment: Codable, Hashable, Sendable {
    public let id: UUID
    public let date: Date
    public let datetime: Date
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        id: UUID,
        date: Date,
        datetime: Date,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.id = id
        self.date = date
        self.datetime = datetime
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.id = try container.decode(UUID.self, forKey: .id)
        self.date = try container.decode(Date.self, forKey: .date)
        self.datetime = try container.decode(Date.self, forKey: .datetime)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.id, forKey: .id)
        try container.encode(self.date, forKey: .date)
        try container.encode(self.datetime, forKey: .datetime)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case id
        case date
        case datetime
    }
}