public enum AppointmentStatus: String, Codable, Hashable, Sendable, CaseIterable {
    case scheduled
    case confirmed
    case inProgress = "in_progress"
    case completed
    case cancelled
    case noShow = "no_show"
}