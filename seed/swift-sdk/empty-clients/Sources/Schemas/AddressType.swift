public struct AddressType: Codable, Hashable, Sendable {
    public let line1: String
    public let line2: String?
    public let city: String
    public let state: String
    public let zip: String
    public let country: JSONValue
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        line1: String,
        line2: String? = nil,
        city: String,
        state: String,
        zip: String,
        country: JSONValue,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.line1 = line1
        self.line2 = line2
        self.city = city
        self.state = state
        self.zip = zip
        self.country = country
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.line1 = try container.decode(String.self, forKey: .line1)
        self.line2 = try container.decodeIfPresent(String.self, forKey: .line2)
        self.city = try container.decode(String.self, forKey: .city)
        self.state = try container.decode(String.self, forKey: .state)
        self.zip = try container.decode(String.self, forKey: .zip)
        self.country = try container.decode(JSONValue.self, forKey: .country)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.line1, forKey: .line1)
        try container.encodeIfPresent(self.line2, forKey: .line2)
        try container.encode(self.city, forKey: .city)
        try container.encode(self.state, forKey: .state)
        try container.encode(self.zip, forKey: .zip)
        try container.encode(self.country, forKey: .country)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case line1
        case line2
        case city
        case state
        case zip
        case country
    }
}