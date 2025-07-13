public struct ExceptionInfo: Codable, Hashable {
    public let exceptionType: String
    public let exceptionMessage: String
    public let exceptionStacktrace: String
}