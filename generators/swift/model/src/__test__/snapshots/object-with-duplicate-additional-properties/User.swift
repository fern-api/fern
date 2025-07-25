public struct User: Codable, Hashable, Sendable {
    public let id: String
    public let email: String
    public let isActive: Bool
    public let additionalProperties: [String]
    public let _additionalProperties: [String: JSONValue]

    public init(
        id: String,
        email: String,
        isActive: Bool,
        additionalProperties: [String],
        _additionalProperties: [String: JSONValue] = .init()
    ) {
        self.id = id
        self.email = email
        self.isActive = isActive
        self.additionalProperties = additionalProperties
        self._additionalProperties = _additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.id = try container.decode(String.self, forKey: .id)
        self.email = try container.decode(String.self, forKey: .email)
        self.isActive = try container.decode(Bool.self, forKey: .isActive)
        self.additionalProperties = try container.decode([String].self, forKey: .additionalProperties)
        self._additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self._additionalProperties)
        try container.encode(self.id, forKey: .id)
        try container.encode(self.email, forKey: .email)
        try container.encode(self.isActive, forKey: .isActive)
        try container.encode(self.additionalProperties, forKey: .additionalProperties)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case id
        case email
        case isActive = "is_active"
        case additionalProperties = "additional_properties"
    }
}