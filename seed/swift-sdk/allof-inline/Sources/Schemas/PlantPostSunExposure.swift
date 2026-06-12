import Foundation

/// Required sun exposure level.
public enum PlantPostSunExposure: String, Codable, Hashable, CaseIterable, Sendable {
    case full
    case partial
    case shade
}