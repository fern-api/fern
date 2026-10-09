import Foundation

public enum LoadRequestCache: String, Codable, Hashable, CaseIterable, Sendable {
    case staleIfSlow = "stale-if-slow"
    case noCache = "no-cache"
}