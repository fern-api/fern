public struct Metadata: Codable, Hashable {
    public let createdAt: Date
    public let updatedAt: Date
    public let avatar: Any
    public let activated: Any?
    public let status: Status
    public let values: Any?
}