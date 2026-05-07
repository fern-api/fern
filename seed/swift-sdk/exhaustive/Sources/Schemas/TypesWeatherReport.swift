import Foundation

public enum TypesWeatherReport: String, Codable, Hashable, CaseIterable, Sendable {
    case sunny = "SUNNY"
    case cloudy = "CLOUDY"
    case raining = "RAINING"
    case snowing = "SNOWING"
}