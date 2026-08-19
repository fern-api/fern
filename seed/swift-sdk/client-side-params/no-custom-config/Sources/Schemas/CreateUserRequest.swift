import Foundation

public struct CreateUserRequest: Codable, Hashable, Sendable {
    public let email: String
    public let emailVerified: Bool?
    public let username: String?
    public let password: String?
    public let phoneNumber: String?
    public let phoneVerified: Bool?
    public let userMetadata: [String: JSONValue]?
    public let appMetadata: [String: JSONValue]?
    public let connection: String
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        email: String,
        emailVerified: Bool? = nil,
        username: String? = nil,
        password: String? = nil,
        phoneNumber: String? = nil,
        phoneVerified: Bool? = nil,
        userMetadata: [String: JSONValue]? = nil,
        appMetadata: [String: JSONValue]? = nil,
        connection: String,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.email = email
        self.emailVerified = emailVerified
        self.username = username
        self.password = password
        self.phoneNumber = phoneNumber
        self.phoneVerified = phoneVerified
        self.userMetadata = userMetadata
        self.appMetadata = appMetadata
        self.connection = connection
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.email = try container.decode(String.self, forKey: .email)
        self.emailVerified = try container.decodeIfPresent(Bool.self, forKey: .emailVerified)
        self.username = try container.decodeIfPresent(String.self, forKey: .username)
        self.password = try container.decodeIfPresent(String.self, forKey: .password)
        self.phoneNumber = try container.decodeIfPresent(String.self, forKey: .phoneNumber)
        self.phoneVerified = try container.decodeIfPresent(Bool.self, forKey: .phoneVerified)
        self.userMetadata = try container.decodeIfPresent([String: JSONValue].self, forKey: .userMetadata)
        self.appMetadata = try container.decodeIfPresent([String: JSONValue].self, forKey: .appMetadata)
        self.connection = try container.decode(String.self, forKey: .connection)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.email, forKey: .email)
        try container.encodeIfPresent(self.emailVerified, forKey: .emailVerified)
        try container.encodeIfPresent(self.username, forKey: .username)
        try container.encodeIfPresent(self.password, forKey: .password)
        try container.encodeIfPresent(self.phoneNumber, forKey: .phoneNumber)
        try container.encodeIfPresent(self.phoneVerified, forKey: .phoneVerified)
        try container.encodeIfPresent(self.userMetadata, forKey: .userMetadata)
        try container.encodeIfPresent(self.appMetadata, forKey: .appMetadata)
        try container.encode(self.connection, forKey: .connection)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case email
        case emailVerified = "email_verified"
        case username
        case password
        case phoneNumber = "phone_number"
        case phoneVerified = "phone_verified"
        case userMetadata = "user_metadata"
        case appMetadata = "app_metadata"
        case connection
    }
}