public struct CreateProblemRequestV2: Codable, Hashable {
    public let problemName: String
    public let problemDescription: ProblemDescription
    public let customFiles: CustomFiles
    public let customTestCaseTemplates: [TestCaseTemplate]
    public let testcases: [TestCaseV2]
    public let supportedLanguages: Any
    public let isPublic: Bool
}