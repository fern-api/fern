import Foundation

/// Why generation stopped.
public enum CompletionFullResponseFinishReason: String, Codable, Hashable, CaseIterable, Sendable {
    case complete
    case length
    case error
}