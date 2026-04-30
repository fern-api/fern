import Foundation

public enum UpdateVendorRequestStatus: String, Codable, Hashable, CaseIterable, Sendable {
    case active = "ACTIVE"
    case inactive = "INACTIVE"
}