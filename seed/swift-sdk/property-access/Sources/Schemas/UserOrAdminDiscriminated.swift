import Foundation

/// Example of an discriminated union
public enum UserOrAdminDiscriminated: Codable, Hashable, Sendable {
    case admin(Admin)
    case empty(Empty)
    case user(User)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "user":
            self = .user(try User(from: decoder))
        case "admin":
            self = .admin(try Admin(from: decoder))
        case "empty":
            self = .empty(try Empty(from: decoder))
        default:
            throw DecodingError.dataCorrupted(
                DecodingError.Context(
                    codingPath: decoder.codingPath,
                    debugDescription: "Unknown shape discriminant value: \(discriminant)"
                )
            )
        }
    }

    public func encode(to encoder: Encoder) throws -> Void {
        switch self {
        case .user(let data):
            try data.encode(to: encoder)
        case .admin(let data):
            try data.encode(to: encoder)
        case .empty(let data):
            try data.encode(to: encoder)
        }
    }

    public struct User: Codable, Hashable, Sendable {
        public let type: String = "user"
        /// The unique identifier for the user.
        public let id: String
        /// The email address of the user.
        public let email: String
        /// The password for the user.
        public let password: String
        /// User profile object
        public let profile: UserProfile
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            id: String,
            email: String,
            password: String,
            profile: UserProfile,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.id = id
            self.email = email
            self.password = password
            self.profile = profile
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.id = try container.decode(String.self, forKey: .id)
            self.email = try container.decode(String.self, forKey: .email)
            self.password = try container.decode(String.self, forKey: .password)
            self.profile = try container.decode(UserProfile.self, forKey: .profile)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.id, forKey: .id)
            try container.encode(self.email, forKey: .email)
            try container.encode(self.password, forKey: .password)
            try container.encode(self.profile, forKey: .profile)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case id
            case email
            case password
            case profile
        }
    }

    public struct Admin: Codable, Hashable, Sendable {
        public let type: String = "admin"
        public let admin: PropertyAccess.Admin
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            admin: PropertyAccess.Admin,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.admin = admin
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.admin = try container.decode(PropertyAccess.Admin.self, forKey: .admin)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.admin, forKey: .admin)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case admin
        }
    }

    public struct Empty: Codable, Hashable, Sendable {
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            self.additionalProperties = try decoder.decodeAdditionalProperties(knownKeys: [])
        }

        public func encode(to encoder: Encoder) throws -> Void {
            try encoder.encodeAdditionalProperties(self.additionalProperties)
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
    }
}