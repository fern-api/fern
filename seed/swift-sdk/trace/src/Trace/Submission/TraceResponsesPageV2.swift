public struct TraceResponsesPageV2: Codable, Hashable {
    public let offset: Int?
    public let traceResponses: [TraceResponseV2]
}