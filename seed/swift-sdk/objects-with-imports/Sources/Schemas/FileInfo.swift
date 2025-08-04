public enum FileInfo: String, Codable, Hashable, CaseIterable, Sendable {
    case regular = "REGULAR"
    case directory = "DIRECTORY"
}