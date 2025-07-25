public struct TokenResponse: Codable, Hashable {
    public let accessToken: String
    public let expiresIn: Int
    public let refreshToken: String?
    public let additionalProperties: [String: JSONValue]

    public init(
        accessToken: String,
        expiresIn: Int,
        refreshToken: String? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.accessToken = accessToken
        self.expiresIn = expiresIn
        self.refreshToken = refreshToken
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.accessToken = try container.decode(String.self, forKey: .accessToken)
        self.expiresIn = try container.decode(Int.self, forKey: .expiresIn)
        self.refreshToken = try container.decodeIfPresent(String.self, forKey: .refreshToken)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.accessToken, forKey: .accessToken)
        try container.encode(self.expiresIn, forKey: .expiresIn)
        try container.encodeIfPresent(self.refreshToken, forKey: .refreshToken)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case accessToken = "access_token"
        case expiresIn = "expires_in"
        case refreshToken = "refresh_token"
    }
}