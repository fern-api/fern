import Foundation

/// User object similar to Auth0 users
public struct User: Codable, Hashable, Sendable {
    public let userId: String
    public let email: String
    public let emailVerified: Bool
    public let username: Nullable<String>?
    public let phoneNumber: Nullable<String>?
    public let phoneVerified: Nullable<Bool>?
    public let createdAt: Date
    public let updatedAt: Date
    public let identities: Nullable<[Identity]>?
    public let appMetadata: Nullable<[String: JSONValue]>?
    public let userMetadata: Nullable<[String: JSONValue]>?
    public let picture: Nullable<String>?
    public let name: Nullable<String>?
    public let nickname: Nullable<String>?
    public let multifactor: Nullable<[String]>?
    public let lastIp: Nullable<String>?
    public let lastLogin: Nullable<Date>?
    public let loginsCount: Nullable<Int>?
    public let blocked: Nullable<Bool>?
    public let givenName: Nullable<String>?
    public let familyName: Nullable<String>?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        userId: String,
        email: String,
        emailVerified: Bool,
        username: Nullable<String>? = nil,
        phoneNumber: Nullable<String>? = nil,
        phoneVerified: Nullable<Bool>? = nil,
        createdAt: Date,
        updatedAt: Date,
        identities: Nullable<[Identity]>? = nil,
        appMetadata: Nullable<[String: JSONValue]>? = nil,
        userMetadata: Nullable<[String: JSONValue]>? = nil,
        picture: Nullable<String>? = nil,
        name: Nullable<String>? = nil,
        nickname: Nullable<String>? = nil,
        multifactor: Nullable<[String]>? = nil,
        lastIp: Nullable<String>? = nil,
        lastLogin: Nullable<Date>? = nil,
        loginsCount: Nullable<Int>? = nil,
        blocked: Nullable<Bool>? = nil,
        givenName: Nullable<String>? = nil,
        familyName: Nullable<String>? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.userId = userId
        self.email = email
        self.emailVerified = emailVerified
        self.username = username
        self.phoneNumber = phoneNumber
        self.phoneVerified = phoneVerified
        self.createdAt = createdAt
        self.updatedAt = updatedAt
        self.identities = identities
        self.appMetadata = appMetadata
        self.userMetadata = userMetadata
        self.picture = picture
        self.name = name
        self.nickname = nickname
        self.multifactor = multifactor
        self.lastIp = lastIp
        self.lastLogin = lastLogin
        self.loginsCount = loginsCount
        self.blocked = blocked
        self.givenName = givenName
        self.familyName = familyName
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.userId = try container.decode(String.self, forKey: .userId)
        self.email = try container.decode(String.self, forKey: .email)
        self.emailVerified = try container.decode(Bool.self, forKey: .emailVerified)
        self.username = try container.decodeNullableIfPresent(String.self, forKey: .username)
        self.phoneNumber = try container.decodeNullableIfPresent(String.self, forKey: .phoneNumber)
        self.phoneVerified = try container.decodeNullableIfPresent(Bool.self, forKey: .phoneVerified)
        self.createdAt = try container.decode(Date.self, forKey: .createdAt)
        self.updatedAt = try container.decode(Date.self, forKey: .updatedAt)
        self.identities = try container.decodeNullableIfPresent([Identity].self, forKey: .identities)
        self.appMetadata = try container.decodeNullableIfPresent([String: JSONValue].self, forKey: .appMetadata)
        self.userMetadata = try container.decodeNullableIfPresent([String: JSONValue].self, forKey: .userMetadata)
        self.picture = try container.decodeNullableIfPresent(String.self, forKey: .picture)
        self.name = try container.decodeNullableIfPresent(String.self, forKey: .name)
        self.nickname = try container.decodeNullableIfPresent(String.self, forKey: .nickname)
        self.multifactor = try container.decodeNullableIfPresent([String].self, forKey: .multifactor)
        self.lastIp = try container.decodeNullableIfPresent(String.self, forKey: .lastIp)
        self.lastLogin = try container.decodeNullableIfPresent(Date.self, forKey: .lastLogin)
        self.loginsCount = try container.decodeNullableIfPresent(Int.self, forKey: .loginsCount)
        self.blocked = try container.decodeNullableIfPresent(Bool.self, forKey: .blocked)
        self.givenName = try container.decodeNullableIfPresent(String.self, forKey: .givenName)
        self.familyName = try container.decodeNullableIfPresent(String.self, forKey: .familyName)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.userId, forKey: .userId)
        try container.encode(self.email, forKey: .email)
        try container.encode(self.emailVerified, forKey: .emailVerified)
        try container.encodeNullableIfPresent(self.username, forKey: .username)
        try container.encodeNullableIfPresent(self.phoneNumber, forKey: .phoneNumber)
        try container.encodeNullableIfPresent(self.phoneVerified, forKey: .phoneVerified)
        try container.encode(self.createdAt, forKey: .createdAt)
        try container.encode(self.updatedAt, forKey: .updatedAt)
        try container.encodeNullableIfPresent(self.identities, forKey: .identities)
        try container.encodeNullableIfPresent(self.appMetadata, forKey: .appMetadata)
        try container.encodeNullableIfPresent(self.userMetadata, forKey: .userMetadata)
        try container.encodeNullableIfPresent(self.picture, forKey: .picture)
        try container.encodeNullableIfPresent(self.name, forKey: .name)
        try container.encodeNullableIfPresent(self.nickname, forKey: .nickname)
        try container.encodeNullableIfPresent(self.multifactor, forKey: .multifactor)
        try container.encodeNullableIfPresent(self.lastIp, forKey: .lastIp)
        try container.encodeNullableIfPresent(self.lastLogin, forKey: .lastLogin)
        try container.encodeNullableIfPresent(self.loginsCount, forKey: .loginsCount)
        try container.encodeNullableIfPresent(self.blocked, forKey: .blocked)
        try container.encodeNullableIfPresent(self.givenName, forKey: .givenName)
        try container.encodeNullableIfPresent(self.familyName, forKey: .familyName)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case userId = "user_id"
        case email
        case emailVerified = "email_verified"
        case username
        case phoneNumber = "phone_number"
        case phoneVerified = "phone_verified"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
        case identities
        case appMetadata = "app_metadata"
        case userMetadata = "user_metadata"
        case picture
        case name
        case nickname
        case multifactor
        case lastIp = "last_ip"
        case lastLogin = "last_login"
        case loginsCount = "logins_count"
        case blocked
        case givenName = "given_name"
        case familyName = "family_name"
    }
}