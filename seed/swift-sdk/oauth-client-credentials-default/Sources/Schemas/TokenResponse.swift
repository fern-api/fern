/// An OAuth token response.
public struct TokenResponse: Codable, Hashable, Sendable {
    public let accessToken: String
    public let expiresIn: Int
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        accessToken: String,
        expiresIn: Int,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.accessToken = accessToken
        self.expiresIn = expiresIn
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.accessToken = try container.decode(String.self, forKey: .accessToken)
        self.expiresIn = try container.decode(Int.self, forKey: .expiresIn)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.accessToken, forKey: .accessToken)
        try container.encode(self.expiresIn, forKey: .expiresIn)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case accessToken = "access_token"
        case expiresIn = "expires_in"
    }
}