public struct File: Codable, Hashable {
    public let name: String
    public let contents: String
    public let info: FileInfo
}