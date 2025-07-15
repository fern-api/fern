public struct PlaylistCreateRequest: Codable, Hashable {
    public let name: String
    public let problems: [ProblemId]
}