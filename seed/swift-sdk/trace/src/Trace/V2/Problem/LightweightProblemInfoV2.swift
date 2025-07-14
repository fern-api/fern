public struct LightweightProblemInfoV2: Codable, Hashable {
    public let problemId: ProblemId
    public let problemName: String
    public let problemVersion: Int
    public let variableTypes: Any
}