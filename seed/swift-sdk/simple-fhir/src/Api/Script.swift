public struct Script: Codable, Hashable {
    public let resourceType: Any
    public let name: String

    enum CodingKeys: String, CodingKey {
        case resourceType = "resource_type"
        case name
    }
}