public struct UpdatePlaylistRequest: Codable, Hashable {
    public let name: String
    public let problems: [ProblemId]
}