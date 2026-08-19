import Foundation

public enum MyCustomEnvironment: String, CaseIterable {
    case production = "https://production.com/api"
    case staging = "https://staging.com/api"
}