import Foundation

public enum VendorStatus: String, Codable, Hashable, CaseIterable, Sendable {
    case active = "ACTIVE"
    case inactive = "INACTIVE"
}