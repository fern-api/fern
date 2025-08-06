public struct StartingAfterPaging: Codable, Hashable, Sendable {
    public let perPage: Int
    public let startingAfter: String?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        perPage: Int,
        startingAfter: String? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.perPage = perPage
        self.startingAfter = startingAfter
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.perPage = try container.decode(Int.self, forKey: .perPage)
        self.startingAfter = try container.decodeIfPresent(String.self, forKey: .startingAfter)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.perPage, forKey: .perPage)
        try container.encodeIfPresent(self.startingAfter, forKey: .startingAfter)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case perPage = "per_page"
        case startingAfter = "starting_after"
    }
}