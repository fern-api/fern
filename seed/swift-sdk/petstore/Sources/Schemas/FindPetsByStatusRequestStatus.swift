public enum FindPetsByStatusRequestStatus: String, Codable, Hashable, Sendable, CaseIterable {
    case available
    case pending
    case sold
}