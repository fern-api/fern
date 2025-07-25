public struct TraceResponsesPage: Codable, Hashable {
    public let offset: Int?
    public let traceResponses: [TraceResponse]
    public let additionalProperties: [String: JSONValue]

    public init(
        offset: Int? = nil,
        traceResponses: [TraceResponse],
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.offset = offset
        self.traceResponses = traceResponses
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.offset = try container.decodeIfPresent(Int.self, forKey: .offset)
        self.traceResponses = try container.decode([TraceResponse].self, forKey: .traceResponses)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encodeIfPresent(self.offset, forKey: .offset)
        try container.encode(self.traceResponses, forKey: .traceResponses)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case offset
        case traceResponses
    }
}