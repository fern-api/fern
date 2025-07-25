public struct WorkspaceTracedUpdate: Codable, Hashable {
    public let traceResponsesSize: Int
    public let additionalProperties: [String: JSONValue]

    public init(traceResponsesSize: Int, additionalProperties: [String: JSONValue] = .init()) {
        self.traceResponsesSize = traceResponsesSize
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.traceResponsesSize = try container.decode(Int.self, forKey: .traceResponsesSize)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.traceResponsesSize, forKey: .traceResponsesSize)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case traceResponsesSize
    }
}