public struct ProblemInfoV2: Codable, Hashable {
    public let problemId: ProblemId
    public let problemDescription: ProblemDescription
    public let problemName: String
    public let problemVersion: Int
    public let supportedLanguages: Any
    public let customFiles: CustomFiles
    public let generatedFiles: GeneratedFiles
    public let customTestCaseTemplates: [TestCaseTemplate]
    public let testcases: [TestCaseV2]
    public let isPublic: Bool
}