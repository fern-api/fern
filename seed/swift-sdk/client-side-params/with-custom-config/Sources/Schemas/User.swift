import Foundation

/// User object similar to Auth0 users
public struct User: Codable, Hashable, Sendable {
    public let userId: String
    public let email: String
    public let emailVerified: Bool
    public let username: String?
    public let phoneNumber: String?
    public let phoneVerified: Bool?
    public let createdAt: Date
    public let updatedAt: Date
    public let identities: [Identity]?
    public let appMetadata: [String: JSONValue]?
    public let userMetadata: [String: JSONValue]?
    public let picture: String?
    public let name: String?
    public let nickname: String?
    public let multifactor: [String]?
    public let lastIp: String?
    public let lastLogin: Date?
    public let loginsCount: Int?
    public let blocked: Bool?
    public let givenName: String?
    public let familyName: String?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        userId: String,
        email: String,
        emailVerified: Bool,
        username: String? = nil,
        phoneNumber: String? = nil,
        phoneVerified: Bool? = nil,
        createdAt: Date,
        updatedAt: Date,
        identities: [Identity]? = nil,
        appMetadata: [String: JSONValue]? = nil,
        userMetadata: [String: JSONValue]? = nil,
        picture: String? = nil,
        name: String? = nil,
        nickname: String? = nil,
        multifactor: [String]? = nil,
        lastIp: String? = nil,
        lastLogin: Date? = nil,
        loginsCount: Int? = nil,
        blocked: Bool? = nil,
        givenName: String? = nil,
        familyName: String? = nil,
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
        self.username = try container.decodeIfPresent(String.self, forKey: .username)
        self.phoneNumber = try container.decodeIfPresent(String.self, forKey: .phoneNumber)
        self.phoneVerified = try container.decodeIfPresent(Bool.self, forKey: .phoneVerified)
        self.createdAt = try container.decode(Date.self, forKey: .createdAt)
        self.updatedAt = try container.decode(Date.self, forKey: .updatedAt)
        self.identities = try container.decodeIfPresent([Identity].self, forKey: .identities)
        self.appMetadata = try container.decodeIfPresent([String: JSONValue].self, forKey: .appMetadata)
        self.userMetadata = try container.decodeIfPresent([String: JSONValue].self, forKey: .userMetadata)
        self.picture = try container.decodeIfPresent(String.self, forKey: .picture)
        self.name = try container.decodeIfPresent(String.self, forKey: .name)
        self.nickname = try container.decodeIfPresent(String.self, forKey: .nickname)
        self.multifactor = try container.decodeIfPresent([String].self, forKey: .multifactor)
        self.lastIp = try container.decodeIfPresent(String.self, forKey: .lastIp)
        self.lastLogin = try container.decodeIfPresent(Date.self, forKey: .lastLogin)
        self.loginsCount = try container.decodeIfPresent(Int.self, forKey: .loginsCount)
        self.blocked = try container.decodeIfPresent(Bool.self, forKey: .blocked)
        self.givenName = try container.decodeIfPresent(String.self, forKey: .givenName)
        self.familyName = try container.decodeIfPresent(String.self, forKey: .familyName)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.userId, forKey: .userId)
        try container.encode(self.email, forKey: .email)
        try container.encode(self.emailVerified, forKey: .emailVerified)
        try container.encodeIfPresent(self.username, forKey: .username)
        try container.encodeIfPresent(self.phoneNumber, forKey: .phoneNumber)
        try container.encodeIfPresent(self.phoneVerified, forKey: .phoneVerified)
        try container.encode(self.createdAt, forKey: .createdAt)
        try container.encode(self.updatedAt, forKey: .updatedAt)
        try container.encodeIfPresent(self.identities, forKey: .identities)
        try container.encodeIfPresent(self.appMetadata, forKey: .appMetadata)
        try container.encodeIfPresent(self.userMetadata, forKey: .userMetadata)
        try container.encodeIfPresent(self.picture, forKey: .picture)
        try container.encodeIfPresent(self.name, forKey: .name)
        try container.encodeIfPresent(self.nickname, forKey: .nickname)
        try container.encodeIfPresent(self.multifactor, forKey: .multifactor)
        try container.encodeIfPresent(self.lastIp, forKey: .lastIp)
        try container.encodeIfPresent(self.lastLogin, forKey: .lastLogin)
        try container.encodeIfPresent(self.loginsCount, forKey: .loginsCount)
        try container.encodeIfPresent(self.blocked, forKey: .blocked)
        try container.encodeIfPresent(self.givenName, forKey: .givenName)
        try container.encodeIfPresent(self.familyName, forKey: .familyName)
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