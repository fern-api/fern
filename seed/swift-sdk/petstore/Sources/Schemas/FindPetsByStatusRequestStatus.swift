public enum FindPetsByStatusRequestStatus: String, Codable, Hashable, CaseIterable, Sendable {
    case available
    case pending
    case sold
}