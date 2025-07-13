public struct Patient: Codable, Hashable {
    public let resourceType: Any
    public let name: String
    public let scripts: [Script]

    enum CodingKeys: String, CodingKey {
        case resourceType = "resource_type"
        case name
        case scripts
    }
}