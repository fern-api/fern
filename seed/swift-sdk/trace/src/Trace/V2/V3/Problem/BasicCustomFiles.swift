public struct BasicCustomFiles: Codable, Hashable {
    public let methodName: String
    public let signature: NonVoidFunctionSignature
    public let additionalFiles: Any
    public let basicTestCaseTemplate: BasicTestCaseTemplate
}