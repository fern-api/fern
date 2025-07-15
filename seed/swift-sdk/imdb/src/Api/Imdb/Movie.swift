public struct Movie: Codable, Hashable {
    public let id: MovieId
    public let title: String
    public let rating: Double
}