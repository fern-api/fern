public struct Movie {
    public let id: MovieId
    public let prequel: MovieId?
    public let title: String
    public let from: String
    public let rating: Double
    public let type: Any
    public let tag: Tag
    public let book: String?
    public let metadata: Any
    public let revenue: Int64
}