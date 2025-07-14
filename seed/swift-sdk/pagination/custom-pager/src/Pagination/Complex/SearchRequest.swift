public struct SearchRequest: Codable, Hashable {
    public let pagination: StartingAfterPaging?
    public let query: SearchRequestQuery
}