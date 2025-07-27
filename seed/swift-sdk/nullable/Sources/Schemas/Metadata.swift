public struct Metadata: Codable, Hashable, Sendable {
    public let createdAt: Date
    public let updatedAt: Date
    public let avatar: JSONValue
    public let activated: JSONValue?
    public let status: Status
    public let values: [String: JSONValue?]?
    public let additionalProperties: [String: JSONValue]

    public init(
        createdAt: Date,
        updatedAt: Date,
        avatar: JSONValue,
        activated: JSONValue? = nil,
        status: Status,
        values: [String: JSONValue?]? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.createdAt = createdAt
        self.updatedAt = updatedAt
        self.avatar = avatar
        self.activated = activated
        self.status = status
        self.values = values
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.createdAt = try container.decode(Date.self, forKey: .createdAt)
        self.updatedAt = try container.decode(Date.self, forKey: .updatedAt)
        self.avatar = try container.decode(JSONValue.self, forKey: .avatar)
        self.activated = try container.decodeIfPresent(JSONValue.self, forKey: .activated)
        self.status = try container.decode(Status.self, forKey: .status)
        self.values = try container.decodeIfPresent([String: JSONValue?].self, forKey: .values)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.createdAt, forKey: .createdAt)
        try container.encode(self.updatedAt, forKey: .updatedAt)
        try container.encode(self.avatar, forKey: .avatar)
        try container.encodeIfPresent(self.activated, forKey: .activated)
        try container.encode(self.status, forKey: .status)
        try container.encodeIfPresent(self.values, forKey: .values)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case createdAt
        case updatedAt
        case avatar
        case activated
        case status
        case values
    }
}