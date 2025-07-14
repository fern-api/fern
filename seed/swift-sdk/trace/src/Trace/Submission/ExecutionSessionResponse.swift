public struct ExecutionSessionResponse: Codable, Hashable {
    public let sessionId: String
    public let executionSessionUrl: String?
    public let language: Language
    public let status: ExecutionSessionStatus
}