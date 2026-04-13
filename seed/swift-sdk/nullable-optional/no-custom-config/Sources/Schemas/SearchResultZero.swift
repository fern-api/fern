import Foundation

public struct SearchResultZero: Codable, Hashable, Sendable {
    public let id: String
    public let username: String
    public let email: Nullable<String>
    public let phone: Nullable<String>?
    public let createdAt: Date
    public let updatedAt: Nullable<Date>
    public let address: Address?
    public let type: SearchResultZeroType
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        id: String,
        username: String,
        email: Nullable<String>,
        phone: Nullable<String>? = nil,
        createdAt: Date,
        updatedAt: Nullable<Date>,
        address: Address? = nil,
        type: SearchResultZeroType,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.id = id
        self.username = username
        self.email = email
        self.phone = phone
        self.createdAt = createdAt
        self.updatedAt = updatedAt
        self.address = address
        self.type = type
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.id = try container.decode(String.self, forKey: .id)
        self.username = try container.decode(String.self, forKey: .username)
        self.email = try container.decode(Nullable<String>.self, forKey: .email)
        self.phone = try container.decodeNullableIfPresent(String.self, forKey: .phone)
        self.createdAt = try container.decode(Date.self, forKey: .createdAt)
        self.updatedAt = try container.decode(Nullable<Date>.self, forKey: .updatedAt)
        self.address = try container.decodeIfPresent(Address.self, forKey: .address)
        self.type = try container.decode(SearchResultZeroType.self, forKey: .type)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.id, forKey: .id)
        try container.encode(self.username, forKey: .username)
        try container.encode(self.email, forKey: .email)
        try container.encodeNullableIfPresent(self.phone, forKey: .phone)
        try container.encode(self.createdAt, forKey: .createdAt)
        try container.encode(self.updatedAt, forKey: .updatedAt)
        try container.encodeIfPresent(self.address, forKey: .address)
        try container.encode(self.type, forKey: .type)
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
        case type
    }
}