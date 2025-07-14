public struct StreamedCompletion: Codable, Hashable {
    public let delta: String
    public let tokens: Int?
}