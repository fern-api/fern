import Foundation

public struct UserResponse: Codable, Hashable, Sendable {
    public let id: String
    public let username: String
    public let email: String?
    public let phone: String?
    public let createdAt: Date
    public let updatedAt: Date?
    public let address: Address?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        id: String,
        username: String,
        email: String? = nil,
        phone: String? = nil,
        createdAt: Date,
        updatedAt: Date? = nil,
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
        self.email = try container.decodeIfPresent(String.self, forKey: .email)
        self.phone = try container.decodeIfPresent(String.self, forKey: .phone)
        self.createdAt = try container.decode(Date.self, forKey: .createdAt)
        self.updatedAt = try container.decodeIfPresent(Date.self, forKey: .updatedAt)
        self.address = try container.decodeIfPresent(Address.self, forKey: .address)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.id, forKey: .id)
        try container.encode(self.username, forKey: .username)
        try container.encodeIfPresent(self.email, forKey: .email)
        try container.encodeIfPresent(self.phone, forKey: .phone)
        try container.encode(self.createdAt, forKey: .createdAt)
        try container.encodeIfPresent(self.updatedAt, forKey: .updatedAt)
        try container.encodeIfPresent(self.address, forKey: .address)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case id
        case username
        case email
        case phone
        case createdAt
        case updatedAt
        case address
    }
}