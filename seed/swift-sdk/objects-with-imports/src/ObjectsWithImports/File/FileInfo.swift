public enum FileInfo: String, Codable, Hashable, Sendable, CaseIterable {
    case regular = "REGULAR"
    case directory = "DIRECTORY"
}