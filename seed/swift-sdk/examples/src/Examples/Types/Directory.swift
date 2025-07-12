public struct Directory {
    public let name: String
    public let files: [File]?
    public let directories: [Directory]?
}