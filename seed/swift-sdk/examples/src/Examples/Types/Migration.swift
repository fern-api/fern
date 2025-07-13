public struct Migration: Codable, Hashable {
    public let name: String
    public let status: MigrationStatus
}