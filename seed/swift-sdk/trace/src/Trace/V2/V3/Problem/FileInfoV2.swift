public struct FileInfoV2: Codable, Hashable {
    public let filename: String
    public let directory: String
    public let contents: String
    public let editable: Bool
}