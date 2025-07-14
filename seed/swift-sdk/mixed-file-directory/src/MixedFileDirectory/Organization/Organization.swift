public struct Organization: Codable, Hashable {
    public let id: Id
    public let name: String
    public let users: [User]
}