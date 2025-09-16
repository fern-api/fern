import Foundation

/// Admin user object
public struct Admin: Codable, Hashable, Sendable {
    /// The unique identifier for the user.
    public let id: String
    /// The email address of the user.
    public let email: String
    /// The password for the user.
    public let password: String
    /// User profile object
    public let profile: UserProfile
    /// The level of admin privileges.
    public let adminLevel: String
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        id: String,
        email: String,
        password: String,
        profile: UserProfile,
        adminLevel: String,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.id = id
        self.email = email
        self.password = password
        self.profile = profile
        self.adminLevel = adminLevel
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.id = try container.decode(String.self, forKey: .id)
        self.email = try container.decode(String.self, forKey: .email)
        self.password = try container.decode(String.self, forKey: .password)
        self.profile = try container.decode(UserProfile.self, forKey: .profile)
        self.adminLevel = try container.decode(String.self, forKey: .adminLevel)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.id, forKey: .id)
        try container.encode(self.email, forKey: .email)
        try container.encode(self.password, forKey: .password)
        try container.encode(self.profile, forKey: .profile)
        try container.encode(self.adminLevel, forKey: .adminLevel)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case id
        case email
        case password
        case profile
        case adminLevel
    }
}