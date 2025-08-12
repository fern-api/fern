import Foundation

public enum SingleUrlEnvironmentNoDefaultEnvironment: String, CaseIterable {
    case production = "https://production.com/api"
    case staging = "https://staging.com/api"
}