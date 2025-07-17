public struct Address: Codable, Hashable {
    public let street: String
    public let city: String
    public let state: String
    public let zipCode: Int
    public let additionalProperties: [String: JSONValue]

    public init(street: String, city: String, state: String, zipCode: Int, additionalProperties: [String: JSONValue] = .init()) {
        self.street = street
        self.city = city
        self.state = state
        self.zipCode = zipCode
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.street = try container.decode(String.self, forKey: .street)
        self.city = try container.decode(String.self, forKey: .city)
        self.state = try container.decode(String.self, forKey: .state)
        self.zipCode = try container.decode(Int.self, forKey: .zipCode)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = try encoder.container(keyedBy: CodingKeys.self)
        try container.encode(self.street, forKey: .street)
        try container.encode(self.city, forKey: .city)
        try container.encode(self.state, forKey: .state)
        try container.encode(self.zipCode, forKey: .zipCode)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case street
        case city
        case state
        case zipCode = "zip_code"
    }
}