import Foundation

extension Requests {
    public struct ServicePatchComplexRequest: Codable, Hashable, Sendable {
        public let name: Nullable<String>?
        public let age: Nullable<Int>?
        public let active: Nullable<Bool>?
        public let metadata: Nullable<[String: JSONValue]>?
        public let tags: Nullable<[String]>?
        public let email: Nullable<String>?
        public let nickname: Nullable<String>?
        public let bio: Nullable<String>?
        public let profileImageUrl: Nullable<String>?
        public let settings: Nullable<[String: JSONValue]>?
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            name: Nullable<String>? = nil,
            age: Nullable<Int>? = nil,
            active: Nullable<Bool>? = nil,
            metadata: Nullable<[String: JSONValue]>? = nil,
            tags: Nullable<[String]>? = nil,
            email: Nullable<String>? = nil,
            nickname: Nullable<String>? = nil,
            bio: Nullable<String>? = nil,
            profileImageUrl: Nullable<String>? = nil,
            settings: Nullable<[String: JSONValue]>? = nil,
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
            self.name = try container.decodeNullableIfPresent(String.self, forKey: .name)
            self.age = try container.decodeNullableIfPresent(Int.self, forKey: .age)
            self.active = try container.decodeNullableIfPresent(Bool.self, forKey: .active)
            self.metadata = try container.decodeNullableIfPresent([String: JSONValue].self, forKey: .metadata)
            self.tags = try container.decodeNullableIfPresent([String].self, forKey: .tags)
            self.email = try container.decodeNullableIfPresent(String.self, forKey: .email)
            self.nickname = try container.decodeNullableIfPresent(String.self, forKey: .nickname)
            self.bio = try container.decodeNullableIfPresent(String.self, forKey: .bio)
            self.profileImageUrl = try container.decodeNullableIfPresent(String.self, forKey: .profileImageUrl)
            self.settings = try container.decodeNullableIfPresent([String: JSONValue].self, forKey: .settings)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encodeNullableIfPresent(self.name, forKey: .name)
            try container.encodeNullableIfPresent(self.age, forKey: .age)
            try container.encodeNullableIfPresent(self.active, forKey: .active)
            try container.encodeNullableIfPresent(self.metadata, forKey: .metadata)
            try container.encodeNullableIfPresent(self.tags, forKey: .tags)
            try container.encodeNullableIfPresent(self.email, forKey: .email)
            try container.encodeNullableIfPresent(self.nickname, forKey: .nickname)
            try container.encodeNullableIfPresent(self.bio, forKey: .bio)
            try container.encodeNullableIfPresent(self.profileImageUrl, forKey: .profileImageUrl)
            try container.encodeNullableIfPresent(self.settings, forKey: .settings)
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