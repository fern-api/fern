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
}