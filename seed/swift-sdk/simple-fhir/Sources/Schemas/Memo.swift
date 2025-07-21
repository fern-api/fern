public struct Memo: Codable, Hashable {
    public let description: String
    public let account: Account?
    public let additionalProperties: [String: JSONValue]

    public init(description: String, account: Account? = nil, additionalProperties: [String: JSONValue] = .init()) {
        self.description = description
        self.account = account
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.description = try container.decode(String.self, forKey: .description)
        self.account = try container.decodeIfPresent(Account.self, forKey: .account)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = try encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.description, forKey: .description)
        try container.encodeIfPresent(self.account, forKey: .account)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case description
        case account
    }
}