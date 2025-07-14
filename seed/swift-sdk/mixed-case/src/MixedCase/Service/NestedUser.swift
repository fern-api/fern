public struct NestedUser: Codable, Hashable {
    public let name: String
    public let nestedUser: User

    enum CodingKeys: String, CodingKey {
        case name = "Name"
        case nestedUser = "NestedUser"
    }
}