import Foundation

public enum PlantBaseWateringFrequency: String, Codable, Hashable, CaseIterable, Sendable {
    case daily
    case weekly
    case biweekly
    case monthly
}