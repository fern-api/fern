public enum PetStatus: String, Codable, Hashable, Sendable, CaseIterable {
    case available
    case pending
    case sold
}