public struct User: Codable, Hashable {
    public let id: String
    public let name: String
    public let address: Address
    public let billingAddress: Address?
    public let additionalProperties: [String: JSONValue]

    public init(id: String, name: String, address: Address, billingAddress: Address? = nil, additionalProperties: [String: JSONValue] = .init()) {
        self.id = id
        self.name = name
        self.address = address
        self.billingAddress = billingAddress
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.id = try container.decode(String.self, forKey: .id)
        self.name = try container.decode(String.self, forKey: .name)
        self.address = try container.decode(Address.self, forKey: .address)
        self.billingAddress = try container.decodeIfPresent(Address.self, forKey: .billingAddress)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = try encoder.container(keyedBy: CodingKeys.self)
        try container.encode(self.id, forKey: .id)
        try container.encode(self.name, forKey: .name)
        try container.encode(self.address, forKey: .address)
        try container.encodeIfPresent(self.billingAddress, forKey: .billingAddress)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case id
        case name
        case address
        case billingAddress = "billing_address"
    }
}