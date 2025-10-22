import Foundation

/// Undiscriminated union for testing
public enum SearchResult: Codable, Hashable, Sendable {
    case document(Document)
    case organization(Organization)
    case user(User)

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let discriminant = try container.decode(String.self, forKey: .type)
        switch discriminant {
        case "document":
            self = .document(try Document(from: decoder))
        case "organization":
            self = .organization(try Organization(from: decoder))
        case "user":
            self = .user(try User(from: decoder))
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
        case .document(let data):
            try data.encode(to: encoder)
        case .organization(let data):
            try data.encode(to: encoder)
        case .user(let data):
            try data.encode(to: encoder)
        }
    }

    public struct User: Codable, Hashable, Sendable {
        public let type: String = "user"
        public let id: String
        public let username: String
        public let email: Nullable<String>
        public let phone: String?
        public let createdAt: Date
        public let updatedAt: Nullable<Date>
        public let address: Address?
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            id: String,
            username: String,
            email: Nullable<String>,
            phone: String? = nil,
            createdAt: Date,
            updatedAt: Nullable<Date>,
            address: Address? = nil,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.id = id
            self.username = username
            self.email = email
            self.phone = phone
            self.createdAt = createdAt
            self.updatedAt = updatedAt
            self.address = address
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.id = try container.decode(String.self, forKey: .id)
            self.username = try container.decode(String.self, forKey: .username)
            self.email = try container.decode(Nullable<String>.self, forKey: .email)
            self.phone = try container.decodeIfPresent(String.self, forKey: .phone)
            self.createdAt = try container.decode(Date.self, forKey: .createdAt)
            self.updatedAt = try container.decode(Nullable<Date>.self, forKey: .updatedAt)
            self.address = try container.decodeIfPresent(Address.self, forKey: .address)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.id, forKey: .id)
            try container.encode(self.username, forKey: .username)
            try container.encode(self.email, forKey: .email)
            try container.encodeIfPresent(self.phone, forKey: .phone)
            try container.encode(self.createdAt, forKey: .createdAt)
            try container.encode(self.updatedAt, forKey: .updatedAt)
            try container.encodeIfPresent(self.address, forKey: .address)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case id
            case username
            case email
            case phone
            case createdAt
            case updatedAt
            case address
        }
    }

    public struct Organization: Codable, Hashable, Sendable {
        public let type: String = "organization"
        public let id: String
        public let name: String
        public let domain: Nullable<String>
        public let employeeCount: Int?
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            id: String,
            name: String,
            domain: Nullable<String>,
            employeeCount: Int? = nil,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.id = id
            self.name = name
            self.domain = domain
            self.employeeCount = employeeCount
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.id = try container.decode(String.self, forKey: .id)
            self.name = try container.decode(String.self, forKey: .name)
            self.domain = try container.decode(Nullable<String>.self, forKey: .domain)
            self.employeeCount = try container.decodeIfPresent(Int.self, forKey: .employeeCount)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.id, forKey: .id)
            try container.encode(self.name, forKey: .name)
            try container.encode(self.domain, forKey: .domain)
            try container.encodeIfPresent(self.employeeCount, forKey: .employeeCount)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case id
            case name
            case domain
            case employeeCount
        }
    }

    public struct Document: Codable, Hashable, Sendable {
        public let type: String = "document"
        public let id: String
        public let title: String
        public let content: String
        public let author: Nullable<String>
        public let tags: [String]?
        /// Additional properties that are not explicitly defined in the schema
        public let additionalProperties: [String: JSONValue]

        public init(
            id: String,
            title: String,
            content: String,
            author: Nullable<String>,
            tags: [String]? = nil,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.id = id
            self.title = title
            self.content = content
            self.author = author
            self.tags = tags
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.id = try container.decode(String.self, forKey: .id)
            self.title = try container.decode(String.self, forKey: .title)
            self.content = try container.decode(String.self, forKey: .content)
            self.author = try container.decode(Nullable<String>.self, forKey: .author)
            self.tags = try container.decodeIfPresent([String].self, forKey: .tags)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.type, forKey: .type)
            try container.encode(self.id, forKey: .id)
            try container.encode(self.title, forKey: .title)
            try container.encode(self.content, forKey: .content)
            try container.encode(self.author, forKey: .author)
            try container.encodeIfPresent(self.tags, forKey: .tags)
        }

        /// Keys for encoding/decoding struct properties.
        enum CodingKeys: String, CodingKey, CaseIterable {
            case type
            case id
            case title
            case content
            case author
            case tags
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case type
    }
}