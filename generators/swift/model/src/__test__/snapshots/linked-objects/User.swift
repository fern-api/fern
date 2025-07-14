public struct User: Codable, Hashable {
    public let id: String
    public let name: String
    public let address: Address
    public let billingAddress: Address?
}