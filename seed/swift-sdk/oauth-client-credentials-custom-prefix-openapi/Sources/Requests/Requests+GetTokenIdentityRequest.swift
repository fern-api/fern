import Foundation

extension Requests {
    public struct GetTokenIdentityRequest: Codable, Hashable, Sendable {
        public let username: String
        public let password: String
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            username: String,
            password: String,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.username = username
            self.password = password
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.username = try container.decode(String.self, forKey: .username)
            self.password = try container.decode(String.self, forKey: .password)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.username, forKey: .username)
            try container.encode(self.password, forKey: .password)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case username
            case password
        }
    }
}