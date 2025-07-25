public enum OauthScope: String, Codable, Hashable, Sendable, CaseIterable {
    case writePets = "write:pets"
    case readPets = "read:pets"
}