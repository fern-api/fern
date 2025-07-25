public enum OrderStatus: String, Codable, Hashable, Sendable, CaseIterable {
    case placed
    case approved
    case delivered
}