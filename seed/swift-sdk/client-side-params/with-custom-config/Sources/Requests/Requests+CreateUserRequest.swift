import Foundation

extension Requests {
    public struct CreateUserRequest: Codable, Hashable, Sendable {
        public let email: String
        public let emailVerified: Nullable<Bool>?
        public let username: Nullable<String>?
        public let password: Nullable<String>?
        public let phoneNumber: Nullable<String>?
        public let phoneVerified: Nullable<Bool>?
        public let userMetadata: Nullable<[String: JSONValue]>?
        public let appMetadata: Nullable<[String: JSONValue]>?
        public let connection: String
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            email: String,
            emailVerified: Nullable<Bool>? = nil,
            username: Nullable<String>? = nil,
            password: Nullable<String>? = nil,
            phoneNumber: Nullable<String>? = nil,
            phoneVerified: Nullable<Bool>? = nil,
            userMetadata: Nullable<[String: JSONValue]>? = nil,
            appMetadata: Nullable<[String: JSONValue]>? = nil,
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
            self.emailVerified = try container.decodeNullableIfPresent(Bool.self, forKey: .emailVerified)
            self.username = try container.decodeNullableIfPresent(String.self, forKey: .username)
            self.password = try container.decodeNullableIfPresent(String.self, forKey: .password)
            self.phoneNumber = try container.decodeNullableIfPresent(String.self, forKey: .phoneNumber)
            self.phoneVerified = try container.decodeNullableIfPresent(Bool.self, forKey: .phoneVerified)
            self.userMetadata = try container.decodeNullableIfPresent([String: JSONValue].self, forKey: .userMetadata)
            self.appMetadata = try container.decodeNullableIfPresent([String: JSONValue].self, forKey: .appMetadata)
            self.connection = try container.decode(String.self, forKey: .connection)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.email, forKey: .email)
            try container.encodeNullableIfPresent(self.emailVerified, forKey: .emailVerified)
            try container.encodeNullableIfPresent(self.username, forKey: .username)
            try container.encodeNullableIfPresent(self.password, forKey: .password)
            try container.encodeNullableIfPresent(self.phoneNumber, forKey: .phoneNumber)
            try container.encodeNullableIfPresent(self.phoneVerified, forKey: .phoneVerified)
            try container.encodeNullableIfPresent(self.userMetadata, forKey: .userMetadata)
            try container.encodeNullableIfPresent(self.appMetadata, forKey: .appMetadata)
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
}