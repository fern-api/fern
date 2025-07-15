public struct InitializeProblemRequest: Codable, Hashable {
    public let problemId: ProblemId
    public let problemVersion: Int?
}