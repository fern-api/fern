public struct NextPage: Codable, Hashable, Sendable {
    public let page: Int
    public let startingAfter: String
    public let additionalProperties: [String: JSONValue]

    public init(
        page: Int,
        startingAfter: String,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.page = page
        self.startingAfter = startingAfter
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.page = try container.decode(Int.self, forKey: .page)
        self.startingAfter = try container.decode(String.self, forKey: .startingAfter)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.page, forKey: .page)
        try container.encode(self.startingAfter, forKey: .startingAfter)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case page
        case startingAfter = "starting_after"
    }
}