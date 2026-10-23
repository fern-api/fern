import Foundation

/// Tests forward-compatible enums that accept
/// both known values and arbitrary strings.
public enum ForwardCompatibleEnum: RawRepresentable, Codable, Hashable, CaseIterable, Sendable {
    case active
    case inactive
    /// A value this version of the SDK does not recognize, such as one the API added later.
    case __unknown(String)

    public static let allCases: [Self] = [.active, .inactive]

    public init(rawValue: String) {
        switch rawValue {
        case "active": self = .active
        case "inactive": self = .inactive
        default: self = .__unknown(rawValue)
        }
    }

    public var rawValue: String {
        switch self {
        case .active: return "active"
        case .inactive: return "inactive"
        case .__unknown(let rawValue): return rawValue
        }
    }

    public init(from decoder: Decoder) throws {
        self.init(rawValue: try decoder.singleValueContainer().decode(String.self))
    }

    public func encode(to encoder: Encoder) throws {
        var container = encoder.singleValueContainer()
        try container.encode(rawValue)
    }
}