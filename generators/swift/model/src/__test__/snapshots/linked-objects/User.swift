public struct User: Codable, Hashable {
    public let id: String
    public let name: String
    public let address: Address
    public let billingAddress: Address?

    public init(id: String, name: String, address: Address, billingAddress: Address? = nil) {
        self.id = id
        self.name = name
        self.address = address
        self.billingAddress = billingAddress
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.id = try container.decode(String.self, forKey: .id)
        self.name = try container.decode(String.self, forKey: .name)
        self.address = try container.decode(Address.self, forKey: .address)
        self.billingAddress = try container.decodeIfPresent(Address.self, forKey: .billingAddress)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = try encoder.container(keyedBy: CodingKeys.self)
        try container.encode(self.id, forKey: .id)
        try container.encode(self.name, forKey: .name)
        try container.encode(self.address, forKey: .address)
        try container.encodeIfPresent(self.billingAddress, forKey: .billingAddress)
    }

    enum CodingKeys: String, CodingKey {
        case id
        case name
        case address
        case billingAddress = "billing_address"
    }
}