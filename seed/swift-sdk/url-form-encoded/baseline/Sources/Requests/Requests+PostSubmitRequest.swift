import Foundation

extension Requests {
    public struct PostSubmitRequest: Codable, Hashable, Sendable {
        /// The user's username
        public let username: String
        /// The user's email address
        public let email: String
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            username: String,
            email: String,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.username = username
            self.email = email
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.username = try container.decode(String.self, forKey: .username)
            self.email = try container.decode(String.self, forKey: .email)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.username, forKey: .username)
            try container.encode(self.email, forKey: .email)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case username
            case email
        }
    }
}