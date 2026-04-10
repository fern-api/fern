import Foundation

extension Requests {
    public struct AuthGetTokenRequest: Codable, Hashable, Sendable {
        public let clientId: String
        public let clientSecret: String
        public let audience: AuthGetTokenRequestAudience
        public let grantType: AuthGetTokenRequestGrantType
        public let scope: Nullable<String>?
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            clientId: String,
            clientSecret: String,
            audience: AuthGetTokenRequestAudience,
            grantType: AuthGetTokenRequestGrantType,
            scope: Nullable<String>? = nil,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.clientId = clientId
            self.clientSecret = clientSecret
            self.audience = audience
            self.grantType = grantType
            self.scope = scope
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.clientId = try container.decode(String.self, forKey: .clientId)
            self.clientSecret = try container.decode(String.self, forKey: .clientSecret)
            self.audience = try container.decode(AuthGetTokenRequestAudience.self, forKey: .audience)
            self.grantType = try container.decode(AuthGetTokenRequestGrantType.self, forKey: .grantType)
            self.scope = try container.decodeNullableIfPresent(String.self, forKey: .scope)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.clientId, forKey: .clientId)
            try container.encode(self.clientSecret, forKey: .clientSecret)
            try container.encode(self.audience, forKey: .audience)
            try container.encode(self.grantType, forKey: .grantType)
            try container.encodeNullableIfPresent(self.scope, forKey: .scope)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case clientId = "client_id"
            case clientSecret = "client_secret"
            case audience
            case grantType = "grant_type"
            case scope
        }
    }
}