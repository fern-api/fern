import Foundation

extension Requests {
    public struct PatchComplexRequest: Codable, Hashable, Sendable {
        public let name: String?
        public let age: Int?
        public let active: Bool?
        public let metadata: [String: JSONValue]?
        public let tags: [String]?
        public let email: JSONValue?
        public let nickname: JSONValue?
        public let bio: JSONValue?
        public let profileImageUrl: JSONValue?
        public let settings: JSONValue?
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            name: String? = nil,
            age: Int? = nil,
            active: Bool? = nil,
            metadata: [String: JSONValue]? = nil,
            tags: [String]? = nil,
            email: JSONValue? = nil,
            nickname: JSONValue? = nil,
            bio: JSONValue? = nil,
            profileImageUrl: JSONValue? = nil,
            settings: JSONValue? = nil,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.name = name
            self.age = age
            self.active = active
            self.metadata = metadata
            self.tags = tags
            self.email = email
            self.nickname = nickname
            self.bio = bio
            self.profileImageUrl = profileImageUrl
            self.settings = settings
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.name = try container.decodeIfPresent(String.self, forKey: .name)
            self.age = try container.decodeIfPresent(Int.self, forKey: .age)
            self.active = try container.decodeIfPresent(Bool.self, forKey: .active)
            self.metadata = try container.decodeIfPresent([String: JSONValue].self, forKey: .metadata)
            self.tags = try container.decodeIfPresent([String].self, forKey: .tags)
            self.email = try container.decodeIfPresent(JSONValue.self, forKey: .email)
            self.nickname = try container.decodeIfPresent(JSONValue.self, forKey: .nickname)
            self.bio = try container.decodeIfPresent(JSONValue.self, forKey: .bio)
            self.profileImageUrl = try container.decodeIfPresent(JSONValue.self, forKey: .profileImageUrl)
            self.settings = try container.decodeIfPresent(JSONValue.self, forKey: .settings)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encodeIfPresent(self.name, forKey: .name)
            try container.encodeIfPresent(self.age, forKey: .age)
            try container.encodeIfPresent(self.active, forKey: .active)
            try container.encodeIfPresent(self.metadata, forKey: .metadata)
            try container.encodeIfPresent(self.tags, forKey: .tags)
            try container.encodeIfPresent(self.email, forKey: .email)
            try container.encodeIfPresent(self.nickname, forKey: .nickname)
            try container.encodeIfPresent(self.bio, forKey: .bio)
            try container.encodeIfPresent(self.profileImageUrl, forKey: .profileImageUrl)
            try container.encodeIfPresent(self.settings, forKey: .settings)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case name
            case age
            case active
            case metadata
            case tags
            case email
            case nickname
            case bio
            case profileImageUrl
            case settings
        }
    }
}