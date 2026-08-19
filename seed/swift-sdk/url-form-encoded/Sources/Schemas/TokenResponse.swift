import Foundation

public struct TokenResponse: Codable, Hashable, Sendable {
    public let accessToken: String?
    public let expiresIn: Int?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        accessToken: String? = nil,
        expiresIn: Int? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.accessToken = accessToken
        self.expiresIn = expiresIn
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.accessToken = try container.decodeIfPresent(String.self, forKey: .accessToken)
        self.expiresIn = try container.decodeIfPresent(Int.self, forKey: .expiresIn)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encodeIfPresent(self.accessToken, forKey: .accessToken)
        try container.encodeIfPresent(self.expiresIn, forKey: .expiresIn)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case accessToken = "access_token"
        case expiresIn = "expires_in"
    }
}