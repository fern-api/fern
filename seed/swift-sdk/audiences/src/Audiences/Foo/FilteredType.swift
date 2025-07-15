public struct FilteredType: Codable, Hashable {
    public let publicProperty: String?
    public let privateProperty: Int

    enum CodingKeys: String, CodingKey {
        case publicProperty = "public_property"
        case privateProperty = "private_property"
    }
}