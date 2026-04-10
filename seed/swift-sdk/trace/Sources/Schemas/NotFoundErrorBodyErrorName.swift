import Foundation

public enum NotFoundErrorBodyErrorName: String, Codable, Hashable, CaseIterable, Sendable {
    case playlistIdNotFoundError = "PlaylistIdNotFoundError"
}