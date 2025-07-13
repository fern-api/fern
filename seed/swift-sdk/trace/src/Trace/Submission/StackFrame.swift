public struct StackFrame: Codable, Hashable {
    public let methodName: String
    public let lineNumber: Int
    public let scopes: [Scope]
}