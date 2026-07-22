import Foundation

extension Requests {
    public struct GetTokenAuthRequest: Codable, Hashable, Sendable {
        public let clientId: String
        public let clientSecret: String
        public let scopes: String
        public let grantType: GetTokenAuthRequestGrantType
        public let tenant: String
        public let optionalHint: String?
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            clientId: String,
            clientSecret: String,
            scopes: String,
            grantType: GetTokenAuthRequestGrantType,
            tenant: String,
            optionalHint: String? = nil,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.clientId = clientId
            self.clientSecret = clientSecret
            self.scopes = scopes
            self.grantType = grantType
            self.tenant = tenant
            self.optionalHint = optionalHint
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.clientId = try container.decode(String.self, forKey: .clientId)
            self.clientSecret = try container.decode(String.self, forKey: .clientSecret)
            self.scopes = try container.decode(String.self, forKey: .scopes)
            self.grantType = try container.decode(GetTokenAuthRequestGrantType.self, forKey: .grantType)
            self.tenant = try container.decode(String.self, forKey: .tenant)
            self.optionalHint = try container.decodeIfPresent(String.self, forKey: .optionalHint)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.clientId, forKey: .clientId)
            try container.encode(self.clientSecret, forKey: .clientSecret)
            try container.encode(self.scopes, forKey: .scopes)
            try container.encode(self.grantType, forKey: .grantType)
            try container.encode(self.tenant, forKey: .tenant)
            try container.encodeIfPresent(self.optionalHint, forKey: .optionalHint)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case clientId = "client_id"
            case clientSecret = "client_secret"
            case scopes
            case grantType = "grant_type"
            case tenant
            case optionalHint = "optional_hint"
        }
    }
}