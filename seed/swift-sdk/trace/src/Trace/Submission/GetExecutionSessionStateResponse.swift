public struct GetExecutionSessionStateResponse: Codable, Hashable {
    public let states: Any
    public let numWarmingInstances: Int?
    public let warmingSessionIds: [String]
}