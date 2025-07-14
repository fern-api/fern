public struct TraceResponsesPage: Codable, Hashable {
    public let offset: Int?
    public let traceResponses: [TraceResponse]
}