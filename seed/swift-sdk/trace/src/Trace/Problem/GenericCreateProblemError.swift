public struct GenericCreateProblemError: Codable, Hashable {
    public let message: String
    public let type: String
    public let stacktrace: String
}