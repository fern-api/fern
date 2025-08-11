public enum MigrationStatus: String, Codable, Hashable, CaseIterable, Sendable {
    /// The migration is running.
    case running = "RUNNING"
    /// The migration failed.
    case failed = "FAILED"
    case finished = "FINISHED"
}