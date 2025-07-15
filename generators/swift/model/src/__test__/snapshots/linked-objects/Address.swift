public struct Address: Codable, Hashable {
    public let street: String
    public let city: String
    public let state: String
    public let zipCode: Int

    public init(street: String, city: String, state: String, zipCode: Int) {
        self.street = street
        self.city = city
        self.state = state
        self.zipCode = zipCode
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.street = try container.decode(String.self, forKey: .street)
        self.city = try container.decode(String.self, forKey: .city)
        self.state = try container.decode(String.self, forKey: .state)
        self.zipCode = try container.decode(Int.self, forKey: .zipCode)
    }

    enum CodingKeys: String, CodingKey {
        case street
        case city
        case state
        case zipCode = "zip_code"
    }
}