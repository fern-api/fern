import Foundation

public struct CreateUserRequest: Codable, Hashable, Sendable {
    public let username: String
    public let email: String?
    public let phone: String?
    public let address: Address?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        username: String,
        email: String? = nil,
        phone: String? = nil,
        address: Address? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.username = username
        self.email = email
        self.phone = phone
        self.address = address
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.username = try container.decode(String.self, forKey: .username)
        self.email = try container.decodeIfPresent(String.self, forKey: .email)
        self.phone = try container.decodeIfPresent(String.self, forKey: .phone)
        self.address = try container.decodeIfPresent(Address.self, forKey: .address)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.username, forKey: .username)
        try container.encodeIfPresent(self.email, forKey: .email)
        try container.encodeIfPresent(self.phone, forKey: .phone)
        try container.encodeIfPresent(self.address, forKey: .address)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case username
        case email
        case phone
        case address
    }
}