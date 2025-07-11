public struct TraceResponseV2 {
    public let submissionId: SubmissionId
    public let lineNumber: Int
    public let file: TracedFile
    public let returnValue: DebugVariableValue?
    public let expressionLocation: ExpressionLocation?
    public let stack: StackInformation
    public let stdout: String?
}