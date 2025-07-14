public struct Playlist: Codable, Hashable {
    public let playlistId: PlaylistId
    public let ownerId: UserId

    enum CodingKeys: String, CodingKey {
        case playlistId = "playlist_id"
        case ownerId = "owner-id"
    }
}