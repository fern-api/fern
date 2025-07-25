public enum MigrationStatus: String, Codable, Hashable, CaseIterable, Sendable {
    case running = "RUNNING"
    case failed = "FAILED"
    case finished = "FINISHED"
}