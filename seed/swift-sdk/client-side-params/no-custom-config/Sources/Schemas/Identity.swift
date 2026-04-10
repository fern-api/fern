import Foundation

public struct Identity: Codable, Hashable, Sendable {
    public let connection: String
    public let userId: String
    public let provider: String
    public let isSocial: Bool
    public let accessToken: String?
    public let expiresIn: Int?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        connection: String,
        userId: String,
        provider: String,
        isSocial: Bool,
        accessToken: String? = nil,
        expiresIn: Int? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.connection = connection
        self.userId = userId
        self.provider = provider
        self.isSocial = isSocial
        self.accessToken = accessToken
        self.expiresIn = expiresIn
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.connection = try container.decode(String.self, forKey: .connection)
        self.userId = try container.decode(String.self, forKey: .userId)
        self.provider = try container.decode(String.self, forKey: .provider)
        self.isSocial = try container.decode(Bool.self, forKey: .isSocial)
        self.accessToken = try container.decodeIfPresent(String.self, forKey: .accessToken)
        self.expiresIn = try container.decodeIfPresent(Int.self, forKey: .expiresIn)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.connection, forKey: .connection)
        try container.encode(self.userId, forKey: .userId)
        try container.encode(self.provider, forKey: .provider)
        try container.encode(self.isSocial, forKey: .isSocial)
        try container.encodeIfPresent(self.accessToken, forKey: .accessToken)
        try container.encodeIfPresent(self.expiresIn, forKey: .expiresIn)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case connection
        case userId = "user_id"
        case provider
        case isSocial = "is_social"
        case accessToken = "access_token"
        case expiresIn = "expires_in"
    }
}