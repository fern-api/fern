public struct ExecutionSessionState {
    public let lastTimeContacted: String?
    public let sessionId: String
    public let isWarmInstance: Bool
    public let awsTaskId: String?
    public let language: Language
    public let status: ExecutionSessionStatus
}