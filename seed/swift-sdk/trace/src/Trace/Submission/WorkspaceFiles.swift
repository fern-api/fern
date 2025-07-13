public struct WorkspaceFiles: Codable, Hashable {
    public let mainFile: FileInfo
    public let readOnlyFiles: [FileInfo]
}