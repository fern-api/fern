public struct Directory: Codable, Hashable {
    public let name: String
    public let files: [File]?
    public let directories: [Directory]?
}