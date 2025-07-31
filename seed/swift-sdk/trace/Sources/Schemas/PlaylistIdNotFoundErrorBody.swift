public enum PlaylistIdNotFoundErrorBody: Codable, Hashable, Sendable {
    case playlistId(PlaylistId)

    public struct PlaylistId: Codable, Hashable, Sendable {
        public let value: PlaylistId

        public init(value: PlaylistId) {
        }

        private enum CodingKeys: String, CodingKey {
        }
    }
}