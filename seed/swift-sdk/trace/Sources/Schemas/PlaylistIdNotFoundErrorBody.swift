public enum PlaylistIdNotFoundErrorBody: Codable, Hashable, Sendable {
    case playlistId(PlaylistId)

    public struct PlaylistId: Codable, Hashable, Sendable {
        public let type: String = "playlistId"
        public let value: PlaylistId
        public let additionalProperties: [String: JSONValue]

        public init(
            value: PlaylistId,
            additionalProperties: [String: JSONValue] = .init()
        ) {
            self.value = value
            self.additionalProperties = additionalProperties
        }

        public init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            self.value = try container.decode(PlaylistId.self, forKey: .value)
            self.additionalProperties = try decoder.decodeAdditionalProperties(using: CodingKeys.self)
        }

        public func encode(to encoder: Encoder) throws -> Void {
            var container = encoder.container(keyedBy: CodingKeys.self)
            try encoder.encodeAdditionalProperties(self.additionalProperties)
            try container.encode(self.value, forKey: .value)
        }

        enum CodingKeys: String, CodingKey, CaseIterable {
            case value
        }
    }
}