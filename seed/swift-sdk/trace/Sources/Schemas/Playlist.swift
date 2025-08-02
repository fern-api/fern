public struct Playlist: Codable, Hashable, Sendable {
    public let name: String
    public let problems: [ProblemId]
    public let playlistId: PlaylistId
    public let ownerId: UserId
    public let additionalProperties: [String: JSONValue]

    public init(
        name: String,
        problems: [ProblemId],
        playlistId: PlaylistId,
        ownerId: UserId,
        additionalProperties: [String: JSONValue] = .init()
    ) {
        self.name = name
        self.problems = problems
        self.playlistId = playlistId
        self.ownerId = ownerId
        self.additionalProperties = additionalProperties
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.name = try container.decode(String.self, forKey: .name)
        self.problems = try container.decode([ProblemId].self, forKey: .problems)
        self.playlistId = try container.decode(PlaylistId.self, forKey: .playlistId)
        self.ownerId = try container.decode(UserId.self, forKey: .ownerId)
        self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
    }

    public func encode(to encoder: Encoder) throws -> Void {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try encoder.encodeAdditionalProperties(self.additionalProperties)
        try container.encode(self.name, forKey: .name)
        try container.encode(self.problems, forKey: .problems)
        try container.encode(self.playlistId, forKey: .playlistId)
        try container.encode(self.ownerId, forKey: .ownerId)
    }

    enum CodingKeys: String, CodingKey, CaseIterable {
        case name
        case problems
        case playlistId = "playlist_id"
        case ownerId = "owner-id"
    }
}