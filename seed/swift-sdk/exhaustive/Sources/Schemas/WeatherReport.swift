public enum WeatherReport: String, Codable, Hashable, Sendable, CaseIterable {
    case sunny = "SUNNY"
    case cloudy = "CLOUDY"
    case raining = "RAINING"
    case snowing = "SNOWING"
}