import Foundation

extension Requests {
    public struct RefreshTokenAuthRequest: Codable, Hashable, Sendable {
        public let refreshToken: String
        public let grantType: RefreshTokenAuthRequestGrantType
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            refreshToken: String,
            grantType: RefreshTokenAuthRequestGrantType,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.refreshToken = refreshToken
            self.grantType = grantType
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.refreshToken = try container.decode(String.self, forKey: .refreshToken)
            self.grantType = try container.decode(RefreshTokenAuthRequestGrantType.self, forKey: .grantType)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.refreshToken, forKey: .refreshToken)
            try container.encode(self.grantType, forKey: .grantType)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case refreshToken = "refresh_token"
            case grantType = "grant_type"
        }
    }
}