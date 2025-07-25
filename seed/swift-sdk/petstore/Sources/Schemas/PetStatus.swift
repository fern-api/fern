public enum PetStatus: String, Codable, Hashable, CaseIterable, Sendable {
    case available
    case pending
    case sold
}