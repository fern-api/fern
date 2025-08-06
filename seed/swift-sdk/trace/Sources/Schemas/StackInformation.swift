public struct StackInformation: Codable, Hashable, Sendable {
    public let numStackFrames: Int
    public let topStackFrame: StackFrame?
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        numStackFrames: Int,
        topStackFrame: StackFrame? = nil,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.numStackFrames = numStackFrames
        self.topStackFrame = topStackFrame
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.numStackFrames = try container.decode(Int.self, forKey: .numStackFrames)
        self.topStackFrame = try container.decodeIfPresent(StackFrame.self, forKey: .topStackFrame)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.numStackFrames, forKey: .numStackFrames)
        try container.encodeIfPresent(self.topStackFrame, forKey: .topStackFrame)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case numStackFrames
        case topStackFrame
    }
}