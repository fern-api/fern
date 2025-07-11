public enum MigrationStatus: String, Codable, Hashable, Sendable, CaseIterable {
    case running = "RUNNING"
    case failed = "FAILED"
    case finished = "FINISHED"
}