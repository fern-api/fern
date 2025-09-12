import Foundation

extension Requests {
    public struct CreateUserRequest: Codable, Hashable, Sendable {
        public let username: String
        public let tags: [String]?
        public let metadata: Metadata?
        public let avatar: Nullable<String>?
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            username: String,
            tags: [String]? = nil,
            metadata: Metadata? = nil,
            avatar: Nullable<String>? = nil,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.username = username
            self.tags = tags
            self.metadata = metadata
            self.avatar = avatar
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.username = try container.decode(String.self, forKey: .username)
            self.tags = try container.decodeIfPresent([String].self, forKey: .tags)
            self.metadata = try container.decodeIfPresent(Metadata.self, forKey: .metadata)
            self.avatar = try container.decodeNullableIfPresent(String.self, forKey: .avatar)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.username, forKey: .username)
            try container.encodeIfPresent(self.tags, forKey: .tags)
            try container.encodeIfPresent(self.metadata, forKey: .metadata)
            try container.encodeNullableIfPresent(self.avatar, forKey: .avatar)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case username
            case tags
            case metadata
            case avatar
        }
    }
}