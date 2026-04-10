import Foundation

extension Requests {
    public struct GetTokenRequest: Codable, Hashable, Sendable {
        public let cid: String
        public let csr: String
        public let scp: String
        public let entityId: String
        public let audience: HttpsApiExampleCom
        public let grantType: ClientCredentials
        public let scope: String?
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            cid: String,
            csr: String,
            scp: String,
            entityId: String,
            audience: HttpsApiExampleCom,
            grantType: ClientCredentials,
            scope: String? = nil,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.cid = cid
            self.csr = csr
            self.scp = scp
            self.entityId = entityId
            self.audience = audience
            self.grantType = grantType
            self.scope = scope
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.cid = try container.decode(String.self, forKey: .cid)
            self.csr = try container.decode(String.self, forKey: .csr)
            self.scp = try container.decode(String.self, forKey: .scp)
            self.entityId = try container.decode(String.self, forKey: .entityId)
            self.audience = try container.decode(HttpsApiExampleCom.self, forKey: .audience)
            self.grantType = try container.decode(ClientCredentials.self, forKey: .grantType)
            self.scope = try container.decodeIfPresent(String.self, forKey: .scope)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.cid, forKey: .cid)
            try container.encode(self.csr, forKey: .csr)
            try container.encode(self.scp, forKey: .scp)
            try container.encode(self.entityId, forKey: .entityId)
            try container.encode(self.audience, forKey: .audience)
            try container.encode(self.grantType, forKey: .grantType)
            try container.encodeIfPresent(self.scope, forKey: .scope)
        }

        public enum ClientCredentials: String, Codable, Hashable, CaseIterable, Sendable {
            case clientCredentials = "client_credentials"
        }

        public enum HttpsApiExampleCom: String, Codable, Hashable, CaseIterable, Sendable {
            case httpsApiExampleCom = "https://api.example.com"
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case cid
            case csr
            case scp
            case entityId = "entity_id"
            case audience
            case grantType = "grant_type"
            case scope
        }
    }
}