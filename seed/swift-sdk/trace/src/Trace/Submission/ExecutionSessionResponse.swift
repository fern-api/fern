public struct ExecutionSessionResponse {
    public let sessionId: String
    public let executionSessionUrl: String?
    public let language: Language
    public let status: ExecutionSessionStatus
}