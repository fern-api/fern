public struct ListUsersExtendedOptionalListResponse: Codable, Hashable {
    public let totalCount: Int
    public let additionalProperties: [String: JSONValue]

    public init(totalCount: Int, additionalProperties: [String: JSONValue] = .init()) {
        self.totalCount = totalCount
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.totalCount = try container.decode(Int.self, forKey: .totalCount)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = try encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.totalCount, forKey: .totalCount)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case totalCount = "total_count"
    }
}