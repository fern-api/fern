public struct StackFrame {
    public let methodName: String
    public let lineNumber: Int
    public let scopes: [Scope]
}