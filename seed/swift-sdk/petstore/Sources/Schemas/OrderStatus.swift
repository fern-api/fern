public enum OrderStatus: String, Codable, Hashable, CaseIterable, Sendable {
    case placed
    case approved
    case delivered
}