public struct WorkspaceRunDetails: Codable, Hashable {
    public let exceptionV2: ExceptionV2?
    public let exception: ExceptionInfo?
    public let stdout: String
}