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
}