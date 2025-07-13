public struct UserPage: Codable, Hashable {
    public let data: UserListContainer
    public let next: UUID?
}