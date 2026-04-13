import Foundation

public struct UserOrAdminDiscriminatedZero: Codable, Hashable, Sendable {
    /// The unique identifier for the user.
    public let id: String?
    /// The email address of the user.
    public let email: String?
    /// The password for the user.
    public let password: String
    /// User profile object
    public let profile: UserProfile
    public let type: UserOrAdminDiscriminatedZeroType
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        id: String? = nil,
        email: String? = nil,
        password: String,
        profile: UserProfile,
        type: UserOrAdminDiscriminatedZeroType,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.id = id
        self.email = email
        self.password = password
        self.profile = profile
        self.type = type
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.id = try container.decodeIfPresent(String.self, forKey: .id)
        self.email = try container.decodeIfPresent(String.self, forKey: .email)
        self.password = try container.decode(String.self, forKey: .password)
        self.profile = try container.decode(UserProfile.self, forKey: .profile)
        self.type = try container.decode(UserOrAdminDiscriminatedZeroType.self, forKey: .type)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encodeIfPresent(self.id, forKey: .id)
        try container.encodeIfPresent(self.email, forKey: .email)
        try container.encode(self.password, forKey: .password)
        try container.encode(self.profile, forKey: .profile)
        try container.encode(self.type, forKey: .type)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case id
        case email
        case password
        case profile
        case type
    }
}