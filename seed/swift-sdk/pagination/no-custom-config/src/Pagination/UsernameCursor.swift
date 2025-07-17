public struct UsernameCursor: Codable, Hashable {
    public let cursor: UsernamePage
    public let additionalProperties: [String: JSONValue]

    public init(cursor: UsernamePage, additionalProperties: [String: JSONValue] = .init()) {
        self.cursor = cursor
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.cursor = try container.decode(UsernamePage.self, forKey: .cursor)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = try encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.cursor, forKey: .cursor)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case cursor
    }
}