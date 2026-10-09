import Foundation

public enum PlantPostWateringFrequency: String, Codable, Hashable, CaseIterable, Sendable {
    case daily
    case weekly
    case biweekly
    case monthly
}