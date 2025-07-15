public struct Error: Codable, Hashable {
    public let category: ErrorCategory
    public let code: ErrorCode
    public let detail: String?
    public let field: String?
}