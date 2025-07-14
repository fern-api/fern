public struct ProblemFiles: Codable, Hashable {
    public let solutionFile: FileInfo
    public let readOnlyFiles: [FileInfo]
}