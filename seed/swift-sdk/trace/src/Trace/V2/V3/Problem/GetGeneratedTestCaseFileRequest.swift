public struct GetGeneratedTestCaseFileRequest: Codable, Hashable {
    public let template: TestCaseTemplate?
    public let testCase: TestCaseV2
}