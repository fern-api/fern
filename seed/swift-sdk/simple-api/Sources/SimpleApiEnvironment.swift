import Foundation

public enum SimpleApiEnvironment: String, CaseIterable {
    case production = "https://api.example.com"
    case staging = "https://staging-api.example.com"
}