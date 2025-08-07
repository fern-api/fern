public struct TraceResponsesPageV2: Codable, Hashable, Sendable {
    /// If present, use this to load subsequent pages.
    /// The offset is the id of the next trace response to load.
    public let offset: Int?
    public let traceResponses: [TraceResponseV2]
    /// Additional properties that are not explicitly defined in the schema
    public let additionalProperties: [String: JSONValue]

    public init(
        offset: Int? = nil,
        traceResponses: [TraceResponseV2],
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.offset = offset
        self.traceResponses = traceResponses
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.offset = try container.decodeIfPresent(Int.self, forKey: .offset)
        self.traceResponses = try container.decode([TraceResponseV2].self, forKey: .traceResponses)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encodeIfPresent(self.offset, forKey: .offset)
        try container.encode(self.traceResponses, forKey: .traceResponses)
    }

    /// Keys for encoding/decoding struct properties.
    enum CodingKeys: String, CodingKey, CaseIterable {
        case offset
        case traceResponses
    }
}