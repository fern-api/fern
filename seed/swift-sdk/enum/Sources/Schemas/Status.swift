public enum Status: String, Codable, Hashable, CaseIterable, Sendable {
    case known = "Known"
    case unknown = "Unknown"
}