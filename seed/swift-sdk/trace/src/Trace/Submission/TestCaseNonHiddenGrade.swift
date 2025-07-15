public struct TestCaseNonHiddenGrade: Codable, Hashable {
    public let passed: Bool
    public let actualResult: VariableValue?
    public let exception: ExceptionV2?
    public let stdout: String
}