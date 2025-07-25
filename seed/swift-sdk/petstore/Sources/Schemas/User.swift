public struct User: Codable, Hashable, Sendable {
    public let email: String?
    public let firstName: String?
    public let id: Int64?
    public let lastName: String?
    public let password: String?
    public let phone: String?
    public let username: String?
    public let userStatus: Int?
    public let additionalProperties: [String: JSONValue]

    public init(
        email: String? = nil,
        firstName: String? = nil,
        id: Int64? = nil,
        lastName: String? = nil,
        password: String? = nil,
        phone: String? = nil,
        username: String? = nil,
        userStatus: Int? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.email = email
        self.firstName = firstName
        self.id = id
        self.lastName = lastName
        self.password = password
        self.phone = phone
        self.username = username
        self.userStatus = userStatus
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.email = try container.decodeIfPresent(String.self, forKey: .email)
        self.firstName = try container.decodeIfPresent(String.self, forKey: .firstName)
        self.id = try container.decodeIfPresent(Int64.self, forKey: .id)
        self.lastName = try container.decodeIfPresent(String.self, forKey: .lastName)
        self.password = try container.decodeIfPresent(String.self, forKey: .password)
        self.phone = try container.decodeIfPresent(String.self, forKey: .phone)
        self.username = try container.decodeIfPresent(String.self, forKey: .username)
        self.userStatus = try container.decodeIfPresent(Int.self, forKey: .userStatus)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encodeIfPresent(self.email, forKey: .email)
        try container.encodeIfPresent(self.firstName, forKey: .firstName)
        try container.encodeIfPresent(self.id, forKey: .id)
        try container.encodeIfPresent(self.lastName, forKey: .lastName)
        try container.encodeIfPresent(self.password, forKey: .password)
        try container.encodeIfPresent(self.phone, forKey: .phone)
        try container.encodeIfPresent(self.username, forKey: .username)
        try container.encodeIfPresent(self.userStatus, forKey: .userStatus)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case email
        case firstName
        case id
        case lastName
        case password
        case phone
        case username
        case userStatus
    }
}