public struct StackInformation: Codable, Hashable {
    public let numStackFrames: Int
    public let topStackFrame: StackFrame?
}