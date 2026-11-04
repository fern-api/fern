import Foundation

public enum EnumWithCustom: RawRepresentable, Codable, Hashable, CaseIterable, Sendable {
    case safe
    case custom
    /// A value this version of the SDK does not recognize, such as one the API added later.
    case __unknown(String)

    public static let allCases: [Self] = [.safe, .custom]

    public init(rawValue: String) {
        switch rawValue {
        case "safe": self = .safe
        case "Custom": self = .custom
        default: self = .__unknown(rawValue)
        }
    }

    public var rawValue: String {
        switch self {
        case .safe: return "safe"
        case .custom: return "Custom"
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