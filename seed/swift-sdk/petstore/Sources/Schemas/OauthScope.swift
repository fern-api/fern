public enum OauthScope: String, Codable, Hashable, CaseIterable, Sendable {
    case writePets = "write:pets"
    case readPets = "read:pets"
}