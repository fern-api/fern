public struct TraceResponse: Codable, Hashable {
    public let submissionId: SubmissionId
    public let lineNumber: Int
    public let returnValue: DebugVariableValue?
    public let expressionLocation: ExpressionLocation?
    public let stack: StackInformation
    public let stdout: String?
}