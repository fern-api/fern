public enum FileInfo: String, Codable, Hashable, CaseIterable, Sendable {
    /// A regular file (e.g. foo.txt).
    case regular = "REGULAR"
    /// A directory (e.g. foo/).
    case directory = "DIRECTORY"
}