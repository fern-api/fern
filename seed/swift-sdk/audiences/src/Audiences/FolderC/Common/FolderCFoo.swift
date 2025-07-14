public struct FolderCFoo: Codable, Hashable {
    public let barProperty: UUID

    enum CodingKeys: String, CodingKey {
        case barProperty = "bar_property"
    }
}